import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { paystackConfig } from 'src/common/config/env.config';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { ICurrentUser } from '../users/interfaces/user.interface';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Endpoint to initialize payment
  @UseGuards(AuthGuard)
  @Post('initialize')
  async initializePayment(
    @Body() body: { email: string; amount: number },
    @Res() res: Response,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    const { email, amount } = body;
    const paymentInit = await this.paymentsService.initializePayment(
      email,
      amount,
      {
        userId: currentUser.sub,
      },
    );
    return CreateSuccessResponse(res, paymentInit, 'Successfull');
  }

  // Webhook to listen for Paystack's payment status updates
  @Post('webhook')
  @HttpCode(200) // Responds with 200 OK by default to acknowledge receipt of the webhook
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const secret = paystackConfig.PAYSTACK_SECRET_KEY; // Your Paystack secret
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    // Verify Paystack's webhook signature
    if (hash === req.headers['x-paystack-signature']) {
      const event = req.body;

      // Handle successful payment event
      if (event.event === 'charge.success') {
        const reference = event.data.reference;

        // Call the verifyPayment method to confirm the payment
        const verifiedPayment =
          await this.paymentsService.verifyPayment(reference);

        // Check if the payment is successfully verified
        if (verifiedPayment.status === 'success') {
          const amount = verifiedPayment.amount;
          const email = verifiedPayment.customer.email;
          const transactionId = verifiedPayment.id; // Transaction ID from Paystack
          const paymentDate = verifiedPayment.transaction_date; // Date of the payment
          const paymentStatus = verifiedPayment.status; // Payment status
          const paymentChannel = verifiedPayment.channel; // e.g., 'card', 'bank'
          const authorization = verifiedPayment.authorization; // Contains card details if paid via card

          const payload: any = {
            amount,
            email,
            transactionId,
            paymentDate,
            transactType: 'credit',
          };

          // Perform any actions here, e.g., update your database, send a receipt, etc.
          const transactUpdate =
            await this.paymentsService.updateTransactionData(payload);

          console.log('Payment verified successfully:', {
            reference,
            amount,
            email,
            transactionId,
            paymentDate,
          });

          // Respond with 200 OK
          return res.status(200).send('Payment verified and processed');
        } else {
          console.error('Payment verification failed:', reference);
          return res.status(400).send('Payment verification failed');
        }
      }
    }

    // If the webhook signature does not match or if it's an unsupported event
    return res
      .status(400)
      .send('Invalid webhook signature or unsupported event');
  }
}

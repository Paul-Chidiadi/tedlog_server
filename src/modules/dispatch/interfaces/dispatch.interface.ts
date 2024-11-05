import { DISPATCH_STATUS, PRODUCT_TYPE } from 'src/common/enums/dispatch.enum';

export interface IDispatch {
  id?: string;
  consignorLocation?: string;
  consignorAddress?: string;
  consignorName?: string;
  consignorContact?: string;
  consigneeLocation?: string;
  consigneeAddress?: string;
  consigneeName?: string;
  consigneeContact?: string;
  productType?: PRODUCT_TYPE;
  itemDescription?: string;
  weight?: string;
  cost?: number;
  voucher?: string;
  status?: DISPATCH_STATUS;
  dateDelivered?: Date;
  dateRecieved?: Date;
}

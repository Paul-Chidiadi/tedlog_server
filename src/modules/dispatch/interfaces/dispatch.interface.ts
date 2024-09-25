import { PRODUCT_TYPE } from 'src/common/enums/dispatch.enum';

export interface IDispatch {
  id?: string;
  consignorLocation?: string;
  consignorName?: string;
  consignorContact?: string;
  consigneeLocation?: string;
  consigneeName?: string;
  consigneeContact?: string;
  productType?: PRODUCT_TYPE;
  itemDescription?: string;
  weight?: string;
  cost?: number;
  voucher?: string;
}

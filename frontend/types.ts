export type ProductType = {
  [index:string]: any;
  sku: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  hasExtras?: 'Yes'|'';
  exclusions?: string;
  singleOptionTitle1?: string;
  singleOptions1?: string;
  singleOptionTitle2?: string;
  singleOptions2?: string;
  singleOptionTitle3?: string;
  singleOptions3?: string;
  multiOptionTitle1?: string;
  multiOptions1?: string; 
  multiOptionTitle2?: string;
  multiOptions2?: string;
  multiOptionTitle3?: string;
  multiOptions3?: string;
}

export type CartItemType = {
  sku: string;
  name: string;
  description: string;
  extras: string;
  price: number;
  quantity: number;
}

export type CartContextType = {
  items: CartItemType[];
  lineItemsCount: number;
  itemsCount: number;
  addItem: (sku: string, name: string, description: string, extras: string, price: number, quantity?: number) => void;
  removeItem: (sku: string, quantity?: number) => void;
  removeLineItem: (sku: string) => void;
  clearCart: () => void;
  isInCart: (sku: string) => boolean;
  getTotal: () => number;
}

export type OrderType = {
  id?: string;
  userId?: string; // Set within transaction
  name: string;
  email: string;
  phone: string;
  deliveryMethod?: 'Delivery' | 'Collect from Cafe';
  address1?: string;
  address2?: string;
  postcode?: string;
  orderNumber?: number;  // Set within transaction
  items: CartItemType[],
  paymentStatus: string;
  amount: number;
  created: string;
  status: string;
  collectionTime: string;
  specialInstructions: string;
  notificationToken: string;
  payPalDetails?: any;
}
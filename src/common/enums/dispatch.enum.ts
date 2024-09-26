export enum PRODUCT_TYPE {
  PERISHABLE = 'perishable', // Products that can spoil, e.g., food
  FRAGILE = 'fragile', // Easily breakable, e.g., glass, electronics
  BULKY = 'bulky', // Large items, e.g., furniture, machinery
  LIQUID = 'liquid', // Liquid products, e.g., chemicals, beverages
  DANGEROUS = 'dangerous', // Hazardous items, e.g., explosives, toxic materials
  DOCUMENT = 'document', // Paper documents or files
  LIVESTOCK = 'livestock', // Animals being transported
  ELECTRONIC = 'electronic', // Gadgets like phones, laptops, etc.
  CLOTHING = 'clothing', // Apparel or garments
  MEDICAL_SUPPLY = 'medical', // Health-related products, e.g., medicines, equipment
  MISC = 'miscellaneous', // Anything that doesn’t fit into other categories
}

export enum DISPATCH_STATUS {
  PENDING = 'pending',
  STARTED = 'started',
  COMPLETED = 'completed',
}

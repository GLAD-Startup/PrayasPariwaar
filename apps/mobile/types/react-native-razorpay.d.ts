declare module "react-native-razorpay" {
  export interface RazorpayPrefill {
    email?: string;
    contact?: string;
    name?: string;
    method?: "card" | "netbanking" | "wallet" | "upi" | "emi";
  }

  export interface RazorpayTheme {
    color?: string;
    backdrop_color?: string;
  }

  export interface RazorpayRetry {
    enabled?: boolean;
    max_count?: number;
  }

  export interface RazorpayModalOptions {
    backdropclose?: boolean;
    escape?: boolean;
    handleback?: boolean;
    confirm_close?: boolean;
    ondismiss?: () => void;
    animation?: boolean;
  }

  export interface RazorpayCheckoutOptions {
    key: string;
    amount: string | number;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id: string;
    prefill?: RazorpayPrefill;
    notes?: Record<string, string>;
    theme?: RazorpayTheme;
    modal?: RazorpayModalOptions;
    subscription_id?: string;
    recurring?: boolean;
    callback_url?: string;
    redirect?: boolean;
    customer_id?: string;
    timeout?: number;
    retry?: RazorpayRetry;
    send_sms_hash?: boolean;
    allow_rotation?: boolean;
    method?: "card" | "netbanking" | "wallet" | "upi" | "emi";
  }

  export interface RazorpaySuccessData {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  export interface RazorpayErrorData {
    code: number;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: Record<string, any>;
  }

  export default class RazorpayCheckout {
    static open(
      options: RazorpayCheckoutOptions,
      successCallback?: (data: RazorpaySuccessData) => void,
      errorCallback?: (error: RazorpayErrorData) => void
    ): Promise<RazorpaySuccessData>;

    static onExternalWalletSelection(
      callback: (data: any) => void
    ): void;
  }
}

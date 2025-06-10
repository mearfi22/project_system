declare module "react-google-recaptcha" {
  import { Component } from "react";

  export interface ReCAPTCHAProps {
    sitekey: string;
    onChange?: (token: string | null) => void;
    theme?: "light" | "dark";
    size?: "normal" | "compact";
    tabindex?: number;
    ref?: any;
  }

  export default class ReCAPTCHA extends Component<ReCAPTCHAProps> {
    reset(): void;
    execute(): Promise<string>;
    getValue(): string | null;
    getWidgetId(): number;
  }
}

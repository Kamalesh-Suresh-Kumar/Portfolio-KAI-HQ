export const HCAPTCHA_CONFIG = {
  /**
   * Official Web3Forms public sitekey for free-plan hCaptcha integration.
   * Documentation reference: https://docs.web3forms.com/how-to-guides/add-spam-protection-with-hcaptcha
   */
  siteKey: "50b2fe65-b00b-4b9e-ad62-3ba471098be2",

  /**
   * Staged activation flag.
   * Defaulted to false while Web3Forms dashboard CAPTCHA setting is 'None'.
   * Set to true once CAPTCHA is activated in the Web3Forms dashboard.
   */
  enabled: false,
} as const;

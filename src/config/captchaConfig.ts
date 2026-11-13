export const HCAPTCHA_CONFIG = {
  /**
   * Official Web3Forms public sitekey for free-plan hCaptcha integration.
   * Documentation: https://docs.web3forms.com/how-to-guides/add-spam-protection-with-hcaptcha
   */
  siteKey: "50b2fe65-b00b-4b9e-ad62-3ba471098be2",

  /**
   * hCaptcha is enabled in the Web3Forms dashboard.
   * Keep enabled to require CAPTCHA verification before submission.
   */
  enabled: true,
} as const;

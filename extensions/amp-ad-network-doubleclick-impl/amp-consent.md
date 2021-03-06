# AMP Consent integration

The `<amp-consent>` element can be used to block the ad request and any [RTC](./doubleclick-rtc.md) requests from being sent until the user or AMP consent [checkConsentHref](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md#consent-configuration) end point provide consent state. After the amp-consent extension has been configured (please refer to its [documentation](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md)), it can be linked to the amp-ad element via the `data-block-on-consent` attribute.

If the user has responded negatively to the amp-consent component (user rejects the consent prompt), RTC call-outs will not be made and [non-personalized ads](https://support.google.com/dfp_premium/answer/9005435) will be requested.  
If the user’s response to the amp-consent is unknown (user dismisses the consent prompt), by default, no ad requests or RTC call-outs are sent.  
If `data-npa-on-unknown-consent` is set to true, non-personalized ads will be requested but RTC call-outs are not sent.

See [Google Ad Manager Help Center article](https://support.google.com/dfp_premium/answer/7678538) for more information.

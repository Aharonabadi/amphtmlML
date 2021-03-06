# AMP Cache Guidelines

## Purpose

Provide guidelines to external parties for implementing their own AMP Caches.

## Preamble

In the AMP ecosystem, the platform that links to content may freely choose which AMP Cache (if any) to use. It is an inversion of the typical model where content delivery is the responsibility of the publisher.

This allows platforms to provide their users with predictable load performance and among other things allows them to ensure required security and privacy invariants during AMP’s pre-rendering phase.

AMP is an open ecosystem and actively encourages the development of more AMP Caches.

## Guidelines: Core

1. An AMP Cache only serves [valid AMP input documents](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).

2. It participates in the [AMP validator release cycle](https://github.com/ampproject/amphtml/tree/main/validator).

3. It participates in the AMP JS library release cycle and makes every effort to serve the latest version. It does not allow sites to perform version locking.

4. It serves each site from a subdomain of the cache domain.

    1. See for example: the [Google AMP Cache URL format](https://developers.google.com/amp/cache/overview#amp-cache-url-format).

5. Pledges to maintain URL space forever (even beyond the lifetime of the cache itself):

    1. This can be achieved by donating the URL space to a trustworthy third party entity such as [archive.org](http://archive.org).

    2. This means that, should a cache decide to no longer operate, URLs should redirect to the origin URL or be served by another cache.

6. Uses HTTPS serving only.

7. Serves a strong [Content Security Policy](https://w3c.github.io/webappsec-csp/) ([CSP](https://developer.chrome.com/extensions/contentSecurityPolicy)) - a CSP defines a mechanism by which web developers can control the resources which a particular page can fetch or execute, as well as a number of security-relevant policy decisions.

    1. Implements separately documented security rewrites on served content.

    2. The CSP should be equivalent or stronger to what is being served on `cdn.ampproject.org`.

    3. Caches must update their CSP in a timely fashion (within 7 days) at the request of the AMP.

8. Supports a public Update Cache mechanism for document publishers to notify the AMP cache about new, updated or deleted documents:

    1. Equivalent to the [Google AMP Update Cache API](https://developers.google.com/amp/cache/update-cache)

9. Supports a public AMP Cache URL API:

    1. Equivalent to the [Google AMP Cache URL API](https://developers.google.com/amp/cache/overview#amp-cache-url-format)

10. Provides a faithful visual and UX reproduction of source document. E.g. changes in image resolution or compression rate may be acceptable if they provide strong benefits in terms of bandwidth usage and load time.

11. No obstruction of the contents, branding or attribution of the original AMP document.

12. No changes to ads, monetization, access (paywall monetization and similar), analytics, or similar.

13. Respects all resource deletions within a reasonable timeframe.

14. Uses a stale-while-revalidate caching model and reasonable min cache time (such as in the order of single digit minutes) is allowed. For example, as per [Google AMP Cache updates](https://developers.google.com/amp/cache/overview#google-amp-cache-updates), "[the cache] uses the origin's caching headers, such as Max-Age, as hints in deciding whether a particular document or resource is stale. When a user makes a request for something that is stale, that request causes a new copy to be fetched, so that the next user gets fresh content":

    1. The cache is allowed to serve stale content independent of HTTP caching headers. It must make reasonable efforts to keep the cache contents fresh and must revalidate content after serving stale responses.

15. Follows [AMP cache modifications best practices](amp-cache-modifications.md).

## Guidelines: Crawling

-   [robots.txt](https://cdn.ampproject.org/robots.txt): Content should be served from the Cache with either the same robot rules as the origin content or stricter rules. See [https://cdn.ampproject.org/robots.txt](https://cdn.ampproject.org/robots.txt) for an example.

## Guidelines: Optional Extensions

-   Participation in [AMP Ads For AMP Pages ("A4A")](https://github.com/ampproject/amphtml/issues/3133) advertisement signing.

## Guidelines: Accepted MIME types

### MIME types for images

Accepted MIME types for images include all `image/` subtypes (e.g. `image/gif`).

### MIME types for fonts

Accepted MIME types for fonts include the following prefixes:

| Media type / subtype          |
| ----------------------------- |
| font/ (e.g. `font/opentype`)  |
| application/font              |
| application/x-font            |
| application/x-woff            |
| image/svg+xml                 |
| application/octet-stream      |
| application/vnd.ms-fontobject |
| binary/octet-stream           |
| text/plain (not recommended)  |

## Guidelines: Resource size limits

For resources (i.e., HTML, images, fonts) that are larger than 12 MB, you may not fetch the resource, and you may return a 404 error.

## Guidelines: Adding a new cache to the AMP ecosystem

-   Add the details of your cache to [caches.json](../../build-system/global-configs/caches.json).
    -   Some tools use the deployed version of this file (<https://cdn.ampproject.org/caches.json>) to automatically generate appropriate CORS headers as described at [CORS Security in AMP Guidelines](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-cors-requests.md#cors-security-in-amp).
-   Handle dynamically generated components:
    -   [`<amp-geo>`](../../extensions/amp-geo/amp-geo.md) — at delivery time, the string `{{AMP_ISO_COUNTRY_HOTPATCH}}` in [`amp-geo.js`](../../extensions/amp-geo/0.1/amp-geo.js) is replaced by a string consisting of the user's ISO country code followed by exactly 26 spaces (to avoid breaking map files).

## References

-   [Bing AMP Cache](https://www.bing.com/webmaster/help/bing-amp-cache-bc1c884c)
    -   [Bing AMP Cache announcement](https://blogs.bing.com/Webmaster-Blog/September-2018/Introducing-Bing-AMP-viewer-and-Bing-AMP-cache)
-   [Google AMP Cache](https://developers.google.com/amp/cache/)
    -   [Google AMP Cache Overview](https://developers.google.com/amp/cache/overview)
    -   The [Google AMP Cache](https://developers.google.com/amp/cache/) is a proxy-based content delivery network for delivering all valid AMP documents.
    -   It fetches AMP HTML pages, caches them, and improves page performance automatically.
    -   When using the Google AMP Cache, the document, all JS files and all images load from the same origin, which is using [HTTP 2.0](https://http2.github.io/) for maximum efficiency.
    -   The cache also comes with a built-in [validation system](https://github.com/ampproject/amphtml/tree/main/validator) which confirms that the page works, and that it doesn’t depend on external resources.
    -   The validation system runs a series of assertions confirming that the page’s markup meets the AMP HTML specification.
    -   [Google AMP Cache FAQ](https://developers.google.com/amp/cache/faq)
    -   [Google AMP Cache updates](https://developers.google.com/amp/cache/overview#google-amp-cache-updates)
    -   [Crawling Google AMP Cache URLs - How-to for search engines](https://docs.google.com/document/d/1V_uLHoa48IlbFl7_3KWT_1JmCf6BnFtt3S_oR4UsasQ/edit?usp=sharing)

# Encoding

Data is encoded as defined by JSON in [RFC4627](http://www.ietf.org/rfc/rfc4627.txt). The default encoding for APIs is UTF-8. Certain characters, such as Emojji may be handled as surrogate unicode pairs (see section '2.5 Strings' of [RFC4627](http://www.ietf.org/rfc/rfc4627.txt)).

Some query parameters may need to be [url encoded](http://en.wikipedia.org/wiki/Percent-encoding) when sending - for example, the `email` parameter value used to query users should be encoded.

> ❗️ HTML Encoding
> It should be noted that the following identifiers are encoded to protect from potential cross-site scripting attacks: '_name_', '_user_id_', '_company_id_' and '_email_'. As a result you may see these identifiers in their encoded format when you retrieve them via the API.
> Note that the characters we encode are double quote, single quote, ampersand, less than and greater than symbols i.e " ' & < >

```html
"X&Ys" == "X&amp;Y&#39;s"
```

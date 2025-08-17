# Font

> A React Font component to set your fonts.

## Install

Install component from your command line.

<CodeGroup>
  ```sh npm
  npm install @react-email/components -E

# or get the individual package

npm install @react-email/font -E

````

```sh yarn
yarn add @react-email/components -E

# or get the individual package

yarn add @react-email/font -E
````

```sh pnpm
pnpm add @react-email/components -E

# or get the individual package

pnpm add @react-email/font -E
```

</CodeGroup>

## Getting started

Add the component to your email template. This applies your font to all tags inside your email.
Note, that not all email clients supports web fonts, this is why it is important to configure your `fallbackFontFamily`.
To view all email clients that supports web fonts [see](https://www.caniemail.com/features/css-at-font-face/)

```jsx
import { Font, Head, Html } from '@react-email/components'

const Email = () => {
  return (
    <Html lang='en'>
      <Head>
        <Font
          fontFamily='Roboto'
          fallbackFontFamily='Verdana'
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle='normal'
        />
      </Head>
    </Html>
  )
}
```

## Props

<ResponseField name="fontFamily" type="string">
  The font family you want to use. If the webFont property is configured, this
  should contain the name of that font
</ResponseField>

<ResponseField name="fallbackFontFamily" type="string">
  The fallback font family the system should you, if web fonts are not supported
  or the chosen font is not installed on the system.
</ResponseField>

<ResponseField name="webFont" type="{url: string, format: string} | undefined">
  The webFont the supported email client should use
</ResponseField>

<ResponseField name="fontWeight" type="number | string">
  The weight of the font
</ResponseField>

<ResponseField name="fontStyle" type="string">
  The style of the font
</ResponseField>

## Support

All components were tested using the most popular email clients.

<div
  role="list"
  className="grid py-2 list-none border rounded-xl text-sm"
  style={{
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
  columnGap: '0.5rem',
  borderColor: 'rgb(30 41 59/1)'
}}
>
  <div className="text-center block not-prose group relative my-2 ring-2 ring-transparent overflow-hidden">
    <img src="https://react.email/static/icons/gmail.svg" width="56px" height="56px" alt="Gmail" className="mx-auto mb-1" />

    Gmail

  </div>

  <div className="text-center block not-prose group relative my-2 ring-2 ring-transparent overflow-hidden">
    <img src="https://react.email/static/icons/apple-mail.svg" width="56px" height="56px" alt="Apple Mail" className="mx-auto mb-1" />

    Apple Mail

  </div>

  <div className="text-center block not-prose group relative my-2 ring-2 ring-transparent overflow-hidden">
    <img src="https://react.email/static/icons/outlook.svg" width="56px" height="56px" alt="Outlook" className="mx-auto mb-1" />

    Outlook

  </div>

  <div className="text-center block not-prose group relative my-2 ring-2 ring-transparent overflow-hidden">
    <img src="https://react.email/static/icons/yahoo-mail.svg" width="56px" height="56px" alt="Yahoo! Mail" className="mx-auto mb-1" />

    Yahoo! Mail

  </div>

  <div className="text-center block not-prose group relative my-2 ring-2 ring-transparent overflow-hidden">
    <img src="https://react.email/static/icons/hey.svg" width="56px" height="56px" alt="HEY" className="mx-auto mb-1" />

    HEY

  </div>

  <div className="text-center block not-prose group relative my-2 ring-2 ring-transparent overflow-hidden">
    <img src="https://react.email/static/icons/superhuman.svg" width="56px" height="56px" alt="Superhuman" className="mx-auto mb-1" />

    Superhuman

  </div>
</div>

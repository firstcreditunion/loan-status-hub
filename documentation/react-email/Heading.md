# Heading

> A block of heading text.

## Install

Install component from your command line.

<CodeGroup>
  ```sh npm
  npm install @react-email/components -E

# or get the individual package

npm install @react-email/heading -E

````

```sh yarn
yarn add @react-email/components -E

# or get the individual package

yarn add @react-email/heading -E
````

```sh pnpm
pnpm add @react-email/components -E

# or get the individual package

pnpm add @react-email/heading -E
```

</CodeGroup>

## Getting started

Add the component to your email template. Include styles where needed.

```jsx
import { Heading } from '@react-email/components'

const Email = () => {
  return <Heading as='h2'>Lorem ipsum</Heading>
}
```

## Props

<ResponseField name="as" type="string" default="h1">
  Render component as `h1`, `h2`, `h3`, `h4`, `h5` or `h6`.
</ResponseField>

<ResponseField name="m" type="string">
  A shortcut for `margin` CSS property.
</ResponseField>

<ResponseField name="mx" type="string">
  A shortcut for `margin-left` and `margin-right` CSS properties.
</ResponseField>

<ResponseField name="my" type="string">
  A shortcut for `margin-top` and `margin-bottom` CSS properties.
</ResponseField>

<ResponseField name="mt" type="string">
  A shortcut for `margin-top` CSS property.
</ResponseField>

<ResponseField name="mr" type="string">
  A shortcut for `margin-right` CSS property.
</ResponseField>

<ResponseField name="mb" type="string">
  A shortcut for `margin-bottom` CSS property.
</ResponseField>

<ResponseField name="ml" type="string">
  A shortcut for `margin-left` CSS property.
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

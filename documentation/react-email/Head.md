# HTML

> A React html component to wrap emails.

## Install

Install component from your command line.

<CodeGroup>
  ```sh npm
  npm install @react-email/components -E

# or get the individual package

npm install @react-email/html -E

````

```sh yarn
yarn add @react-email/components -E

# or get the individual package

yarn add @react-email/html -E
````

```sh pnpm
pnpm add @react-email/components -E

# or get the individual package

pnpm add @react-email/html -E
```

</CodeGroup>

## Getting started

Add the component to your email template. Include styles where needed.

```jsx
import { Html, Button } from '@react-email/components'

const Email = () => {
  return (
    <Html lang='en' dir='ltr'>
      <Button href='https://example.com' style={{ color: '#61dafb' }}>
        Click me
      </Button>
    </Html>
  )
}
```

## Props

<ResponseField name="lang" type="string" default="en">
  Identify the language of text content on the email
</ResponseField>

<ResponseField name="dir" type="string" default="ltr">
  Identify the direction of text content on the email
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

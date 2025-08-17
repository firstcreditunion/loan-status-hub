# Section

> Display a section that can also be formatted using rows and columns.

## Install

Install component from your command line.

<CodeGroup>
  ```sh npm
  npm install @react-email/components -E

# or get the individual package

npm install @react-email/section -E

````

```sh yarn
yarn add @react-email/components -E

# or get the individual package

yarn add @react-email/section -E
````

```sh pnpm
pnpm add @react-email/components -E

# or get the individual package

pnpm add @react-email/section -E
```

</CodeGroup>

## Getting started

Add the component to your email template. Include styles where needed.

```jsx
import { Section, Column, Row, Text } from "@react-email/components";

const Email = () => {
  return (
    {/* A simple `section` */}
    <Section>
      <Text>Hello World</Text>
    </Section>

    {/* Formatted with `rows` and `columns` */}
     <Section>
      <Row>
        <Column>Column 1, Row 1</Column>
        <Column>Column 2, Row 1</Column>
      </Row>
      <Row>
        <Column>Column 1, Row 2</Column>
        <Column>Column 2, Row 2</Column>
      </Row>
    </Section>
  );
};
```

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

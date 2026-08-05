# ReactImage

react-img-component is a lightweight, responsive React component for handling image lazy loading with optional placeholder support. It enhances performance by loading images only when they are visible in the viewport.

## Features

✅ **Lazy Loading** – Loads images only when they enter the viewport.  
✅ **Blurred Placeholder** – Supports an optional placeholder with a blur effect before loading the actual image.  
✅ **Fully Customizable** – Pass any additional props like `className`, `style`, etc.  
✅ **Lightweight & Easy to Use** – Minimal dependencies and simple implementation.  

## Installation

You can install the package via npm or yarn:

```sh
npm install react-img-component
# or
yarn add react-img-component
```

## Usage

Import and use `ReactImage` in your React project:

```tsx
import ReactImage from 'react-img-component';


      <ReactImage
        src="https://example.com/high-res-image.jpg"
        alt="Example Image"
        placeholderSrc="https://example.com/low-res-placeholder.jpg"
      />
```

## Props

| Prop            | Type     | Default | Description |
|----------------|----------|---------|-------------|
| `src`          | `string` | Required | The URL of the actual image to load. |
| `alt`          | `string` | Required | Alternative text for the image. |
| `placeholderSrc` | `string` | `undefined` | URL of the placeholder image (low-res or blurred). |
| `...restProps` | `any` | `undefined` | Any additional props like `className`, `style`, etc. |

## How It Works
- Uses **Intersection Observer** to detect when the image enters the viewport.
- Until visible, the component renders the `placeholderSrc` (if provided) with a blur effect.
- When visible, it loads the actual `src` and removes the blur effect smoothly.

## Example with Custom Styles
```tsx
<ReactImage
  src="https://example.com/photo.jpg"
  alt="Nature"
  placeholderSrc="https://example.com/placeholder.jpg"
  className="rounded-md shadow-lg"
  style={{ width: 300, height: 200 }}
/>
```

## License

MIT License © 2025

# react-img-component

# Custom i18n System

Zero-dependency, type-safe internationalization for Next.js.

## API

### Client Components

```typescript
import { useMessages, useTranslations, useLocale } from '@/lib/i18n/client'
```

#### `useMessages()` - Recommended for static access

Returns the messages object with full TypeScript type safety.

```typescript
export default function MyComponent() {
  const messages = useMessages()

  return (
    <div>
      {/* ✅ Full IDE autocomplete */}
      {/* ✅ TypeScript errors for typos */}
      {/* ✅ Rename refactoring works */}
      <h1>{messages.privacy.title}</h1>
      <p>{messages.privacy.breadcrumb.home}</p>
    </div>
  )
}
```

#### `useTranslations()` - For dynamic access

Returns a translation function with partial TypeScript autocomplete.

```typescript
export default function ToolsList({ tools }) {
  const t = useTranslations()

  return (
    <ul>
      {tools.map(tool => (
        <li key={tool.id}>
          {/* ✅ TypeScript autocomplete for top-level keys */}
          {/* ✅ tool.id is type-safe (ToolId type) */}
          {t(`tools.${tool.id}.name`)}
        </li>
      ))}
    </ul>
  )
}
```

With namespace:

```typescript
const t = useTranslations('common')
return <button>{t('copy')}</button> // reads 'common.copy'
```

#### `useLocale()`

Returns the current locale.

```typescript
const locale = useLocale() // 'ja' | 'en'
```

### Server Components

```typescript
import { getMessages, getTranslations } from '@/lib/i18n/server'
```

#### `getMessages(locale)` - Recommended for static access

```typescript
export default async function Page({ params }) {
  const { locale } = await params
  const messages = await getMessages(locale)

  return (
    <div>
      <h1>{messages.privacy.title}</h1>
      <Breadcrumb items={[
        { label: messages.privacy.breadcrumb.home, href: '/' }
      ]} />
    </div>
  )
}
```

#### `getTranslations(locale, namespace?)` - For dynamic access

```typescript
export default async function ToolPage({ params, toolId }) {
  const { locale } = await params
  const t = await getTranslations(locale)

  // ✅ TypeScript autocomplete for top-level keys
  return <h1>{t(`tools.${toolId}.name`)}</h1>
}
```

## Usage Guidelines

### When to use `useMessages()` / `getMessages()`

✅ **Static property access** - You know the exact key at compile time
```typescript
messages.privacy.title
messages.common.copy
messages.tools.iromide.name
```

✅ **Benefits:**
- Full TypeScript autocomplete
- Compile-time type checking
- Refactoring support (rename works)
- No runtime overhead

### When to use `useTranslations()` / `getTranslations()`

✅ **Dynamic key construction** - Key depends on runtime values
```typescript
t(`tools.${toolId}.name`)
t(`categories.${categoryId}`)
```

✅ **Benefits:**
- Flexible dynamic access
- Template literal support
- Namespace support

## Message Structure

Messages are organized in split TypeScript files:

```
src/messages/
├── ja/
│   ├── common.ts
│   ├── privacy.ts
│   └── ...
├── en/
│   ├── common.ts (type-checked against ja)
│   └── ...
├── ja.ts (base type definition)
└── en.ts (validated against ja)
```

### Type Safety

English messages are validated against Japanese structure:

```typescript
// en/common.ts
import type { common as jaCommon } from '../ja/common'
import type { SameStructure } from '../type-utils'

export const common: SameStructure<typeof jaCommon> = {
  copy: 'Copy',    // ✅ OK
  invalid: 'Test'  // ❌ TypeScript error - key doesn't exist in ja
}
```

## Migration from next-intl

```diff
// Client components
- import { useTranslations } from 'next-intl'
+ import { useMessages } from '@/lib/i18n/client'

- const t = useTranslations()
- return <div>{t('privacy.title')}</div>
+ const messages = useMessages()
+ return <div>{messages.privacy.title}</div>

// Server components
- import { getTranslations } from 'next-intl/server'
+ import { getMessages } from '@/lib/i18n/server'

- const t = await getTranslations()
- return <div>{t('privacy.title')}</div>
+ const messages = await getMessages(locale)
+ return <div>{messages.privacy.title}</div>
```

## Benefits over next-intl

- ✅ **Zero dependencies** - No external packages
- ✅ **Smaller bundle** - ~2KB vs ~50KB
- ✅ **Better type safety** - Object access has perfect autocomplete
- ✅ **Simpler SSG** - No middleware or complex setup
- ✅ **Full control** - Easy to customize and extend

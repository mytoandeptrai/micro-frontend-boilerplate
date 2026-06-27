## ADDED Requirements

### Requirement: @ops/ui export đầy đủ shadcn components Phase 2
`packages/ui/src/index.ts` SHALL export tất cả các components sau: Table (TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption), Dialog (DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger), Card (CardHeader, CardContent, CardFooter, CardTitle, CardDescription), Badge, Checkbox, Form (FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription), Input, Label, Popover (PopoverContent, PopoverTrigger), ScrollArea, Select (SelectContent, SelectItem, SelectTrigger, SelectValue), Textarea, Tooltip (TooltipContent, TooltipProvider, TooltipTrigger), Sonner (Toaster).

#### Scenario: Import Table từ @ops/ui thành công
- **WHEN** `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@ops/ui"`
- **THEN** không có TypeScript error, components render được

#### Scenario: Import Dialog từ @ops/ui thành công
- **WHEN** `import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ops/ui"`
- **THEN** không có TypeScript error, Dialog render được với overlay

#### Scenario: Import Form components từ @ops/ui thành công
- **WHEN** `import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ops/ui"`
- **THEN** không có TypeScript error, Form components tích hợp được với react-hook-form

#### Scenario: Import Sonner Toaster từ @ops/ui thành công
- **WHEN** `import { Toaster } from "@ops/ui"` và render `<Toaster />`
- **THEN** không có TypeScript error, toast() function hoạt động

#### Scenario: Import Badge từ @ops/ui thành công
- **WHEN** `import { Badge } from "@ops/ui"` và render `<Badge variant="default">Admin</Badge>`
- **THEN** Badge render với đúng styles

### Requirement: shadcn components trong @ops/ui không bundle lại ở remote apps
Khi remote app (team-app) import components từ `@ops/ui`, các components SHALL được bundle một lần duy nhất từ `@ops/ui`, không bị inline lại trong bundle của remote app.

#### Scenario: @ops/ui là shared dep
- **WHEN** kiểm tra MF shared config của team-app
- **THEN** `@ops/ui` được khai báo trong shared (nếu áp dụng) hoặc được import trực tiếp từ package mà không duplicate

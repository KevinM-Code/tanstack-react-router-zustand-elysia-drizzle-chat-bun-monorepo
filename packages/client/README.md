# tanstack-start-react19-tailwind-2-link-nav-starter
A Tanstack Start starting project using React 19 and tailwind with 2-navigation links and some server functions that write to a file.

# Production CSS
```
pnpm build
```
### Just in case

If there is no css using the link how it is 
```
<link rel="stylesheet" href="/assets/ssr-DvDdi3ED.css"/>
``` 
run the script 
```
npx tailwindcss -i app/routes/main.css -o .output/public/assets/global.css --minify
```
change in the __root.tsx file in the `RootDocument` function to `<link rel="stylesheet" href="/assets/global.css"/>` 
and delete the other css file
```
pnpm start
```

```
git clone --single-branch --branch withPrisma https://github.com/KevinM-Code/tanstack-start-react19-tailwind-2-link-nav-starter.git
git clone --single-branch --branch withDrizzle https://github.com/KevinM-Code/tanstack-start-react19-tailwind-2-link-nav-starter.git
```

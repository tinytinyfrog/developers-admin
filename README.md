# forum-admin

## 环境
- node: 14.15.0
- vue: 2.5.2

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## 访问

localhost:端口/admin

## 部署

打包后是静态资源，放入`web`容器后配置`nginx`即可

> 前后端ngixn 配置如下

```
location /_nuxt {
        proxy_pass http://127.0.0.1:3000/_nuxt;
        index index.html index.htm;
        proxy_connect_timeout 300; #单位秒
        proxy_send_timeout 300; #单位秒
        proxy_read_timeout 300; #单位秒
    }
    location /developers-server/ {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://127.0.0.1:8080/developers-server/;
        index index.html index.htm;
        proxy_connect_timeout 300; #单位秒
        proxy_send_timeout 300; #单位秒
        proxy_read_timeout 300; #单位秒
    }


    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://127.0.0.1:3000;
        index index.html index.htm;
        proxy_connect_timeout 300; #单位秒
        proxy_send_timeout 300; #单位秒
        proxy_read_timeout 300; #单位秒
    }
    location /admin/ {
        root /usr/local/nginx/forum-admin/admin/;
        index  index.html index.htm;
    }
```

> forum-admin 打包后丢到admin文件夹即可

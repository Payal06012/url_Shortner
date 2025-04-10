import http from "http";
import {readFile, writeFile} from "fs/promises";
import path from "path";
import crypto from "crypto";

const PORT = 3002;
const DATA_FILE = path.join("data","links.json");

console.log(crypto.randomBytes(4).toString("hex"));

const serveFile = async (res, filePath, contentType) => {
    try{
        const data = await readFile(filePath);
        res.writeHead(200,{"Content-Type": contentType});
        res.end(data);
        
        }catch(error){
            res.writeHead(404,{"Content-Type": "text/plain"});
            res.end("404 page not found");
        }
}


const loadLinks = async() => {
try{
const data = await readFile(DATA_FILE,"utf-8");
return JSON.parse(data);
}
catch(error){
if(error.code === "ENOENT"){
    await writeFile(DATA_FILE,JSON.stringify({}));
    return {};
}
throw error;
}
};


const saveLinks = async (links) => {
await writeFile(DATA_FILE,JSON.stringify(links));
}


//create server

const server = http.createServer(async (req,res) => {
    console.log(req.url);
//! serving html and css file to server
    if(req.method === 'GET'){
        if(req.url === '/'){
    return serveFile(res, path.join("public","url.html"), "text/html");
        }
        else if(req.url === '/url.css'){
        return  serveFile(res, path.join("public","url.css"), "text/css");
            }

            else if(req.url=== '/links'){
                const links  = await loadLinks();
                res.writeHead(200,{"Content-Type": "application/json"});
               return res.end(JSON.stringify(links));
            }

             else{
                 const links = await loadLinks();
                 const shortCode = req.url.slice(1);
               console.log("LINKS redirect" , req.url);
                if(links[shortCode]){
                    res.writeHead(302, { location : links[shortCode]});
                    return res.end();
                }
                
        
                res.writeHead(404 , {"Content-Type": "application/json"});
                return res.end("shortened url is not found");

            }
        }

        //using post method to send data from frontened to backend by using input feild
        if(req.method === "POST" && req.url === "/shorten"){

            // get data from links.json file
     const links  = await loadLinks();

        let body = "";
        req.on('data',(chunk) => {
          body += chunk;
        //   console.log(body);
        })

        req.on('end',async () => {
            console.log(body);
            const {url,shortCode} = JSON.parse(body);
            if(!url){
                res.writeHead(400,{"Content-Type" :"text/plain"});
                return res.end("URL is required");
            }

            // ! check duplicate 
            const finalCode = shortCode || crypto.randomBytes(4).toString("hex");
            if(links[finalCode]){
              res.writeHead(400,{"Content-Type" :"text/plain"});
             return res.end("Short code is already exists. Please choose another");
            }
            links[finalCode] = url;
            console.log(links[finalCode]);
          await saveLinks(links);
             res.writeHead(200,{"Content-Type" :"application/json"});
          res.end(JSON.stringify({success:true,shortCode:finalCode}));
        });
        }
    }
   
)



    server.listen(PORT,() => {
        console.log(`Server running at http://localhost:${PORT}`);
    })


// const server = http.createServer(async (req,res) => {
// if(req.method === 'GET'){
//     if(req.url === '/'){
// try{
// const data = await readFile(path.join("public","url.html"));
// res.writeHead(200,{"Content-Type": "text/html"});
// res.end(data);

// }catch(error){
//     res.writeHead(404,{"Content-Type": "text/html"});
//     res.end("404 page not found");
// }
//     }
// }
// if(req.method === 'GET'){
//     if(req.url === '/url.css'){
// try{
// const data = await readFile(path.join("public","url.css"));
// res.writeHead(200,{"Content-Type": "text/css"});
// res.end(data);

// }catch(error){
//     res.writeHead(404,{"Content-Type": "text/css"});
//     res.end("404 page not found");
// }
//     }
// }
//     }
// )



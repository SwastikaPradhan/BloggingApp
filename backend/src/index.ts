import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: String;
  };
}>();



app.post('/signup',async(c)=>{
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  try{

   const user = await prisma.user.create({
      data:{
        email:body.email,
        name:body.name,
        password:body.password,      
      }
    })
   const jwt = await sign({
    id:user.id
   },c.env.JWT_SECRET);
   return c.text(jwt)

  }catch(e){
       console.log(e);
       c.status(411);
       return c.text('Invalid');

  }
  
})



app.post('/signin',async(c)=>{
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  try{

   const user = await prisma.user.findFirst({
      where: {
        
        name:body.name,
        password:body.password,      
      }
    })

    if(!user){
      c.status(403);
      return c.json({
        message:"Incorrect Creds"
      });
    }
   const jwt = await sign({
    id:user.id
   },c.env.JWT_SECRET);
   return c.text(jwt)

  }catch(e){
       console.log(e);
       
  }
  
})








export default app;




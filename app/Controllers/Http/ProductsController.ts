import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {schema} from '@ioc:Adonis/Core/Validator'
import Product from 'App/Models/Product'

export default class ProductsController {
    public async insert({request}:HttpContextContract){
        const product=schema.create({
            productName:schema.string(),
            productPrice:schema.number()
        })
        const message={'*':(field,rule) => {return `${rule} erron on ${field}`}}
        const payload=await request.validate({schema:product,messages:message})
        const newProduct= await Product.create(payload)
        return newProduct
    }
//view
    public async view({response}:HttpContextContract){
        response.send(await Product.all())
    }
//update
public async update({request}:HttpContextContract){
    const newProduct=schema.create({
        productName:schema.string(),
        productPrice:schema.number()
    })
    const message={'*':(rule,field)=>{return `${rule} error at ${field}`}}
    const payload=await request.validate({schema:newProduct,messages:message})
    const oldProduct=await Product.findBy('productName',payload['productName'])
    if(oldProduct){
        oldProduct.productPrice=payload.productPrice
        await oldProduct.save()
        return oldProduct
    }
    else
    {
        return `Given productName ${payload.productName} not found!`
    }
}
//delete
    public async delete({params}:HttpContextContract){
        const product=params.id
        const oldProduct=await Product.findBy('productId',product)
        if(oldProduct){
            await oldProduct.delete()
        }
        else
        {
            return `Given productId ${product} not found!`
        }
    }
//search function
    public async search({request,response,params}:HttpContextContract){
        const miniPrice = (params.min)
        const maxPrice = (params.max)
        const { searchQuery }=request.all()
        const searchProduct=await Product.query()
                                    .select('*')
                                    .from('products')
                                    .where('product_price','>=',`${miniPrice}`)
                                    .andWhere('product_price','<=',`${maxPrice}`)
                                    .andWhere(function(query){
                                        query
                                        .whereRaw('product_id::text ILIKE ?',`%${searchQuery}%`)
                                        .orWhere('product_name','ILIKE',`%${searchQuery}%`)
                                        .orWhereRaw('product_price::text ILIKE ?',`%${searchQuery}%`)
                                    })
        return response.json(searchProduct)
    }
}

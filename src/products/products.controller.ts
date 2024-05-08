import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //*@Post() : Esto se puede conservar siempre y cuando se este trabajando en un hibrido (Rest + microservicio)
  @MessagePattern({cmd:'create_product'})
  //*@Payload : lo remplezaremos por el @Body
   create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  //@Get()
  @MessagePattern({cmd:'find_all_products'})
  //*@Payload : lo remplezaremos por el @Query
  findAll(@Payload() paginationDto:PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  //@Get(':id')
  @MessagePattern({cmd:'find_one_product'})
  findOne(@Payload('id', ParseIntPipe) id: number) {

    return this.productsService.findOne(id);

    
  }

  //@Patch(':id')
  @MessagePattern({cmd:'update_product'})
  update(
    //@Param('id',ParseIntPipe)  id: number,
    // @Body() updateProductDto: UpdateProductDto
    @Payload() updateProductDto: UpdateProductDto
     ) {

    if(!updateProductDto || Object.keys(updateProductDto).length==0) throw new BadRequestException('Faltan propiedades');
    
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  //@Delete(':id')
  @MessagePattern({cmd:'delet_product'})
  remove(@Payload('id',ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @MessagePattern({cmd:'validate_products'})
  validateProducts(@Payload() ids: number[]){
    return this.productsService.validateProducs(ids)
  }
}

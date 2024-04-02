import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService')

  //*Configuración para conectar con PrismaClient
  onModuleInit() {
      this.$connect();
    this.logger.log('Database Connected');
  }

  create(createProductDto: CreateProductDto) {

    return this.product.create({
      data : createProductDto
    })

  }

  async findAll(paginationDto:PaginationDto) {
    const {page, limit} = paginationDto;
    const totalPages  = await this.product.count({where:{available : true}});
    const lastPage = Math.ceil(totalPages/limit); //ultima pagina
    return {
      data : await this.product.findMany({
        skip: (page - 1) * limit, //* esto me sirve para no saltarme el primer registro(pocisión 0) y obtener la cantidad de registros segun el limit
        take: limit,
        where:{available : true},
      }),
      meta : {
        total: totalPages,
        page: page,
        lastPage : lastPage
      }
    }

  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where:{
        id
      }
    });

    if(!product) throw new NotFoundException('Producto no existe');
    return product;


  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ...data } = updateProductDto;
    await this.findOne(id);

    return await this.product.update({
      where: {id},
      data: data
    })
  }

  async remove(id: number) {

    await this.findOne(id);
    
    // return this.product.delete({
    //   where: { id }
    // });

    const product = await this.product.update({
      where: { id },
      data: {
        available: false
      }
    });

    return product;


  }

}

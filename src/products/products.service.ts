import {
  HttpCode,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';
import { number } from 'joi';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  //*Configuración para conectar con PrismaClient
  onModuleInit() {
    this.$connect();
    this.logger.log('Database Connected');
  }

  async create(createProductDto: CreateProductDto) {
    const existProduct = await this.product.findFirst({
      where: {
        name: createProductDto.name,
      },
    });

    if (existProduct)
      throw new RpcException({
        message: `El producto con nombre ${createProductDto.name} ya existe`,
        status: HttpStatus.BAD_REQUEST,
      });

    const product = await this.product.create({
      data: createProductDto,
    });

    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit); //ultima pagina
    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit, //* esto me sirve para no saltarme el primer registro(pocisión 0) y obtener la cantidad de registros segun el limit
        take: limit,
        where: { available: true },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: {
        id,
      },
    });

    // if(!product) throw new NotFoundException('Producto no existe');
    //*Para el manejo de errores en microservicio podemos hacer uso de RpcException
    if (!product)
      throw new RpcException({
        message: `Producto no existe con id ${id}`,
        status: HttpStatus.BAD_REQUEST,
      });

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    await this.findOne(id);

    return await this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // return this.product.delete({
    //   where: { id }
    // });

    const product = await this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });

    return product;
  }

  async validateProducs(ids: number[]) {
    //*Eliminamos ids duplicados, y lo volvemos a convertir en un array de ids unicos
    ids = Array.from<number>(new Set(ids)); //!Set : Es un objeto que permite almacenar valores unicos sin duplicados

    //*Obtenemos todos los productos mientras el id este incluido(in), en nuestro arreglo de ids
    const producst = await this.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (producst.length !== ids.length) {
      throw new RpcException({
        message: 'Some products were not found',
        statusbar: HttpStatus.BAD_REQUEST,
      });
    }

    return producst;
  }
}

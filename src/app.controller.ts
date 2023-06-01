import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LazyModuleLoader } from '@nestjs/core';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private lazyModuleLoader: LazyModuleLoader,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('cats/lazy')
  async getLazyCats(): Promise<Array<string>> {
    /**
     * NOTE: we cannot lazy-load controllers, resolvers, and gateways. Similarly we cannot register
     * middlware functions on-demand. This is because they often require subscribing/listening to
     * specific topics/channels before connections are established in the case of transport strategiessw
     * for Kafka/gRPC/RabbitMQ or they do not allow the registration of routes after application is
     * ready/successfully listening in the case of Fastify. Similar problems arise with GraphQL in NestJS
     * because of the code-first approach in the @nestjs/graphql package, which requires all classes
     * to be loaded beforehand.
     */
    const { CatsModule } = await import('./cats/cats.module');
    //this lazy-loads the CatsModule and returns a moduleRef
    const moduleRef = await this.lazyModuleLoader.load(() => CatsModule);
    console.log('cat module lazily loaded: ', moduleRef);
    //we need to get injection token so we can look up provider with moduleRef.get()
    const { CatsService } = await import('./cats/cats.service');
    //technically CatsService was already instantiated when module was lazy-loaded - we just need to retrieve the reference to it here
    const catsService = moduleRef.get(CatsService);
    console.log('cat service lazily loaded: ', catsService);
    return catsService.findAllCats();
  }
}

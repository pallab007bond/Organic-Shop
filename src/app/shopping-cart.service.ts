import { Product } from './models/product';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/take';
import { take } from 'rxjs/operators';
import { ShoppingCart } from './models/shopping-cart';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  constructor(private db: AngularFireDatabase) { }
  private create() {
    return this.db.list('/shopping-carts').push({
      dateCreated: new Date().getTime()
    });
  }
    async getcart(): Promise<Observable<ShoppingCart>> {
      const cartId = await this.getOrCreateCartId();
      return this.db.object<ShoppingCart>('/shopping-carts/' + cartId).valueChanges();
    }
  private getItem(cartId: string, productId: string) {
    return this.db.object<any>('/shopping-carts/' + cartId + '/items/' + productId);
  }

 private async getOrCreateCartId(): Promise<string> {
    const cartId = localStorage.getItem('cartId');
    if (cartId) {return cartId; }
      const result = await this.create();
        localStorage.setItem('cartId', result.key);
  }
  async addToCart(product: Product) {
    this.updateProductQuantity(product, 1);
  }
  removeFromCart(product: Product): any {
    this.updateProductQuantity(product, -1);
  }
  private async updateProductQuantity(product: Product, change: number) {
    const cartId = await this.getOrCreateCartId();
    const item$ = this.getItem(cartId, product.id);
     item$.snapshotChanges().pipe(take(1)).subscribe(item => {
      if (item.key != null) {
        item$.update({ product: product, quantity: (item.payload.val().quantity || 0) + change});
      } else {
        item$.set({product: product, quantity: 1});
      }
   });
  }
}

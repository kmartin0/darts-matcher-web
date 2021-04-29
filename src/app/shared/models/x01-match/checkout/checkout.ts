import {Dart} from './dart';

export interface Checkout {
  checkout: number;
  minDarts: number;
  suggested: Dart[];
}

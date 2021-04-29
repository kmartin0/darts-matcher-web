import {Component, OnInit} from '@angular/core';
import {HOME} from '../../constants/web-endpoints';

@Component({
  selector: 'app-unauthenticated',
  templateUrl: './unauthenticated.component.html',
  styleUrls: ['./unauthenticated.component.scss']
})
export class UnauthenticatedComponent implements OnInit {

  routes = {
    home: HOME
  };

  private redirect: string;

  ngOnInit() {
    this.redirect = window.location.pathname;
  }

}

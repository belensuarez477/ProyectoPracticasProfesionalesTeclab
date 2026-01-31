import { Component } from '@angular/core';

import { Welcome } from "./components/welcome/welcome";
import { Description } from "./components/description/description";
import { Benefits } from "./components/benefits/benefits";
import { Footer } from '../../core/layout/footer/footer';
import { Navbar } from '../../core/layout/navbar/navbar';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ Welcome, Description, Benefits, Footer, Navbar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomePage {}



import { Component } from '@angular/core';
import { Welcome} from '../../components/welcome/welcome';
import { Description } from '../../components/description/description';
import { Steps } from '../../components/steps/steps';
import { Benefits } from '../../components/benefits/benefits';
import { Navbar } from '../../../../core/layout/navbar/navbar';
import { Footer } from '../../../../core/layout/footer/footer';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [Welcome,Description,Steps,Benefits,Navbar,Footer],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

}

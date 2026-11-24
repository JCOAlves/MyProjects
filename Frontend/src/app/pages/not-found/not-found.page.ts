import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandComponent } from '../../shared/brand.component';
import { IllustrationComponent } from '../../shared/illustration.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, BrandComponent, IllustrationComponent, ThemeToggleComponent],
  templateUrl: './not-found.page.html',
  styleUrl: './not-found.page.css',
})
export class NotFoundPage {}

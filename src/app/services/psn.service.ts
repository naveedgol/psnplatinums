import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { retry } from 'rxjs/operators';
import { User } from '../types/User';
import { Trophy } from '../types/Trophy';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PsnService {
  debug = false;
  dict = {};

  constructor(private http: HttpClient) {
    this.http.get('./assets/data/images.json').subscribe(
      data => {
        this.dict = data;
      }
    )
  }

  getHigherQualityImages() {
    for (var i = 1; i <= 105; ++i) {
      const options = {
        responseType: 'text' as const,
        params: { 'type': 'platinum', 'page': i.toString() },
      };
      this.http.get(this.psnUrl + 'trophies', options).pipe(retry(10)).subscribe(
        data => {
          const domparser = new DOMParser();
          const doc = domparser.parseFromString(data, "text/html");
          const games = doc.querySelectorAll("picture.game");
          const trophies = doc.querySelectorAll("picture.trophy");
          // console.log(games[9].childNodes[1].srcset.split(" ")[1]);
          for (var i = 0; i < games.length; ++i) {
            const gameIcon = (games[i].childNodes[1] as HTMLImageElement).srcset.split(" ")[1];
            const gameId = gameIcon.split("/")[4]
            this.dict[gameId] = {
              'gameIcon': gameIcon,
              'icon': (trophies[i].childNodes[1] as HTMLImageElement).srcset.split(" ")[1]
            }
          }
          if (Object.keys(this.dict).length > 100 * 50)
            console.log(JSON.stringify(this.dict));
        }
      )
    }
  }

  psnUrl = 'https://cors-anywhere.herokuapp.com/https://psnprofiles.com/';

  getProfile(psn_id): Observable<any> {
    const options = {
      responseType: 'text' as const
    };
    if (this.debug) {
      return this.http.get('./assets/data/profile.html', options);
    }
    return this.http.get(this.psnUrl + psn_id + '?completion=platinum', options).pipe(retry(2));
  }

  parseCount(doc, trophyClass: string): number {
    return parseInt(doc.querySelectorAll("li." + trophyClass)[0].innerText.trim().replace(/,/g, ''));
  }

  parseUser(data: string, psn_id: string): User {
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(data, "text/html");
    if (doc.getElementById("update-find")) {
      return undefined;
    }
    var user = new User();
    user.id = psn_id;
    user.bronzeCount = this.parseCount(doc, "bronze");
    user.silverCount = this.parseCount(doc, "silver");
    user.goldCount = this.parseCount(doc, "gold");
    user.platinumCount = this.parseCount(doc, "platinum");
    user.level = parseInt((doc.querySelectorAll("li.icon-sprite.level")[0] as HTMLElement).innerText);
    user.avatar = doc.getElementsByTagName("img")[6].src;
    var levelProgress = doc.querySelector("div.progress-bar").childNodes[1].textContent.substring(6, 8);
    if (levelProgress[1] === '%') {
      levelProgress = levelProgress.substring(0, 1);
    }
    user.levelProgress = parseInt(levelProgress);
    return user;
  }

  getMonthNumberFromString(month: string): number {
    return new Date(Date.parse(month + " 1, 2012")).getMonth()
  }

  parsePlats(data: string): Trophy[] {
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(data, "text/html");
    const titles = doc.querySelectorAll("a.title");
    const icons = doc.querySelectorAll("img.trophy");
    const games = doc.querySelectorAll("img.game");
    const nums = doc.querySelectorAll("b");
    const rarities = Array.from(doc.querySelectorAll("span.typo-top")).filter(x => (x as HTMLElement).innerText.slice(-1) === '%');
    const dates = doc.querySelectorAll("span.typo-top-date");

    const plats = [];

    for (var i = 0; i < titles.length; ++i) {
      var trophy = new Trophy();
      trophy.gameId = (games[i] as HTMLImageElement).src.split("/")[4];
      trophy.name = (titles[i] as HTMLElement).innerText;
      // trophy.rarity = games[i].innerText;
      trophy.icon = (icons[i] as HTMLImageElement).src;
      trophy.game = (games[i] as HTMLElement).title;
      trophy.gameIcon = (games[i] as HTMLImageElement).src;
      if (this.dict[trophy.gameId]) {
        trophy.icon = this.dict[trophy.gameId].icon;
        trophy.gameIcon = this.dict[trophy.gameId].gameIcon;
      }
      trophy.num = parseInt(nums[i].innerText.substring(1).replace(/,/g, ''));
      trophy.rarity = parseFloat((rarities[i] as HTMLElement).innerText);
      let date: Date = new Date();
      let d = (dates[i] as HTMLElement).innerText.trim().split(" ");
      date.setMonth(this.getMonthNumberFromString(d[1]));
      date.setFullYear(parseInt(d[2]));
      date.setDate(parseInt(d[0].slice(0, -2)));
      trophy.date = date;
      plats.push(trophy);
    }

    return plats;
  }

  getPlatinums(psn_id: string, pageCount: number): Observable<any> {
    const options = {
      headers: { 'accept': 'text/html' },
      params: { 'type': 'platinum', 'page': pageCount.toString() },
      responseType: 'text' as const
    };
    if (this.debug) {
      return this.http.get('./assets/data/platpage' + pageCount.toString() + '.html', options);
    }
    return this.http.get(this.psnUrl + psn_id + "/log", options).pipe(retry(10));
  }

}
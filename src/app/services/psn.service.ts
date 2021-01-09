import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { retry } from 'rxjs/operators';
import { User } from '../types/User';
import { Trophy, defaultList } from '../types/Trophy';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PsnService {
  debug = !environment.production;
  dict = {};
  user = new User();
  platinums: Trophy[] = defaultList;

  constructor(private http: HttpClient) {
    this.http.get('./assets/data/images.json').subscribe(
      data => {
        this.dict = data;
      }
    )
  }

  psnUrl = 'https://cors-anywhere.herokuapp.com/https://psnprofiles.com/';

  getProfile(psn_id): Observable<any> {
    const options = {
      responseType: 'text' as const,
      params: { 'psn_id': psn_id },
    };
    if (this.debug) {
      return this.http.get('./assets/data/profile.html', options);
    }
    return this.http.get("https://hvo2t8h0ck.execute-api.us-east-1.amazonaws.com/default/fetchProfile", options).pipe(retry(2));
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
    user.avatar = doc.getElementsByTagName('meta')[8].content;
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
      const cachedImage = this.dict[trophy.gameId];
      if (cachedImage) {
        trophy.icon = cachedImage.icon;
        trophy.gameIcon = cachedImage.gameIcon;
        trophy.platform = cachedImage.platform;
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
      params: { 'psn_id': psn_id, 'page': pageCount.toString() },
      responseType: 'text' as const
    };
    if (this.debug) {
      return this.http.get('./assets/data/platpage' + pageCount.toString() + '.html', options);
    }
    return this.http.get("https://hvo2t8h0ck.execute-api.us-east-1.amazonaws.com/fetchPlatinums", options).pipe(retry(1));
  }

  async fetchProfile(psn_id: string, loadingProgress) {
    if (this.user && psn_id == this.user.id) {
      return;
    }

    this.platinums = [];

    let profile = '';
    await this.getProfile(psn_id).toPromise()
      .then(data => {
        profile = data;
      })
      .catch(err => {
        if (err.status === 429) {
          throw "An error occured. Servers throttled, please try later.";
        } else {
          throw "An error occured.";
        }
      });

    this.user = this.parseUser(profile, psn_id);
    loadingProgress.total = this.user.platinumCount;
    if (this.user === undefined) {
      throw "User does not exist. Try adding your profile to PSNProfiles.";
    }

    for (var i = 0; i < this.user.platinumCount; i += 50) {
      await this.getPlatinums(psn_id, (i / 50) + 1).toPromise()
        .then(data => {
          this.platinums = this.platinums.concat(this.parsePlats(data));
          loadingProgress.fetched = this.platinums.length;
        })
        .catch(() => {
          throw "An error occured.";
        });
    }
  }

}
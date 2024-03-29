# copa what? 
In one sentence, Copa is a web app with intent to revolutionize hosting and participating in our high school's (SYK) soccer tournaments. 

![front page](https://github.com/Qanpi/copa/assets/61239034/dd82f4c4-e950-4f99-9afe-cd16a04b4af6)

Here is some of what Copa brings to the table for participants:
- [x] create lasting, customizable team profiles and invite friends
- [x] check the latest tournament updates anywhere you are on mobile
- [x] view easy-to-understand group stage and play-off standings
- [x] know when and where each match occurs
- [x] follow LIVE score updates
- [ ] explore all teams and matches between them in a graph-like (nodes for teams, edges for matches) map
- [ ] gamble (not real money!) on match outcomes [still in development]

And for organizers:
- [x] oversee registered participants
- [x] notify of last-minute changes with notifications
- [x] draw teams into groups using a fortune wheel
- [x] customize the bracket structure
- [x] schedule and run matches with an in-built timer
- [x] crown the winner and immortalize memories with pictures 

## copa why? 
A few years back, Eero Koskenvesa (SYK alumn) hosted the first niche, futsal-like tournament, where teams of four battled it out in six minute matches. Copa de Kuutio has since captured the hearts of many in our school (myself included), and typically sees nearly all 600 high school students coming together in a jubilant ceremony.

At the same time, these tournaments were organized through spreadsheets posted on Instagram, requiring a lot of manual labor to both plan and follow. The mission of the Copa web app is to simplify this process, simultaneously introducing new features and preserving tournament history, _while maintaining the Copa spirit and a low barrier to entry_. 

## copa how? 
Copa is the product of a year (and counting) of work, combining both front- and back-end technology to produce a single-page application (SPA). It is built on top of the MERN stack, which is a fusion of MongoDB, Express, React and Node. In addition, the application is currently hosted on Azure. For in-depth technical information and guidance on contributing, refer to [the wiki](https://github.com/Qanpi/copa/wiki). 

## copa statement
At Copa, we take privacy and consent very seriously. You can find a disclaimer of what data is collected [here](https://github.com/Qanpi/copa/wiki/FAQ#what-data-is-collected-about-me). In addition, almost all features are opt-in, meaning that you have to consent to publicize your profile, your real name is only visible to the organizer, and so on. Again, the application acts as an _opportunity_ to deeper engage with the tournament, _not a mandate_. 

# Acknowledgements
This application would not exist without the unwavering support of the community, and the shoulders of open-source giants upon which Copa resides.

### People
* Urho Heinonen - student council representative; thank you for helping with Finnish translations and outreach.
* Jarmo Hurri - CS teacher; thank you for keeping me sane through seemingly endless bugs.
* L21i - my class; thank you for helping beta-test Copa to resolve many of the seemingly endless bugs.

### Packages
* brackets-manager
* react-query
* material UI
* passport-js

and many more acknowledged in package.json...

# License
MIT License

Copyright (c) 2024 Aleksei Terin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

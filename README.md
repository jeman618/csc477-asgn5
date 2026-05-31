# Asgn5

## Write Up
I wanted to answer the question on a choropleth map because that is how every news agency visualizes election data. When the user hovers over a state, I wanted to show total votes for each candidate and their party, so I grouped each state and got candidates and their parties for each of them. I also showed swing states as denoted by black stripes if the race there was extremely close. I included a legend for who won a state for clarity. There is also a widget that goes through the 1976-2024 elections because it would not be as interesting if my visualization only had one election.

After finishing it, I figured including a bar chart showing total votes for each candidate would compliment it well. I only plotted candidates with more than 2,500 votes because in more recent elections there have been a lot more candidates. Including all of them would create a lot of clutter and fixing that would require making the chart larger than the choropleth, which I did not want. I also mitigated that by including a button that controls how many candidates are plotted. Any candidates that are not Democratic nor Republican are green because including colors for each party when only two are actual competitors is pointless. It is also animated so that the bars go from bottom to top.

I got the dataset from [Harvard Dataverse](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/42MVDX). It only contains the popular vote and not the electoral vote. Some data is missing for some candidates in certain states on certain election years, such as their political party and even their name.

<hr>

This is an [Observable Framework](https://observablehq.com/framework/) app. To install the required dependencies, run:

```
npm install
```

Then, to start the local preview server, run:

```
npm run dev
```

Then visit <http://localhost:3000> to preview your app.

For more, see <https://observablehq.com/framework/getting-started>.

## Project structure

A typical Framework project looks like this:

```ini
.
├─ src
│  ├─ components
│  │  └─ timeline.js           # an importable module
│  ├─ data
│  │  ├─ launches.csv.js       # a data loader
│  │  └─ events.json           # a static data file
│  ├─ example-dashboard.md     # a page
│  ├─ example-report.md        # another page
│  └─ index.md                 # the home page
├─ .gitignore
├─ observablehq.config.js      # the app config file
├─ package.json
└─ README.md
```

**`src`** - This is the “source root” — where your source files live. Pages go here. Each page is a Markdown file. Observable Framework uses [file-based routing](https://observablehq.com/framework/project-structure#routing), which means that the name of the file controls where the page is served. You can create as many pages as you like. Use folders to organize your pages.

**`src/index.md`** - This is the home page for your app. You can have as many additional pages as you’d like, but you should always have a home page, too.

**`src/data`** - You can put [data loaders](https://observablehq.com/framework/data-loaders) or static data files anywhere in your source root, but we recommend putting them here.

**`src/components`** - You can put shared [JavaScript modules](https://observablehq.com/framework/imports) anywhere in your source root, but we recommend putting them here. This helps you pull code out of Markdown files and into JavaScript modules, making it easier to reuse code across pages, write tests and run linters, and even share code with vanilla web applications.

**`observablehq.config.js`** - This is the [app configuration](https://observablehq.com/framework/config) file, such as the pages and sections in the sidebar navigation, and the app’s title.

## Command reference

| Command           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `npm install`            | Install or reinstall dependencies                        |
| `npm run dev`        | Start local preview server                               |
| `npm run build`      | Build your static site, generating `./dist`              |
| `npm run deploy`     | Deploy your app to Observable                            |
| `npm run clean`      | Clear the local data loader cache                        |
| `npm run observable` | Run commands like `observable help`                      |

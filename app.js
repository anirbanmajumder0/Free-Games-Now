const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const path = require('path')
var cron = require('node-cron')
const app = express()
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
var games = []


const getPostTitles = async () => {
	try {
		const { data } = await axios.get(
			'https://isthereanydeal.com/specials/'
		);
		const $ = cheerio.load(data);
		var postTitles = [];
		const exp = [];

		$('div.bundle-container-outer.giveaway > div > div > div > div.bundle-title > a').each((_idx, el) => {
			const postTitle = $(el).text()
			const postUrl = $(el).attr('href')
			postTitles.push([postTitle, postUrl])
		});
		$('div.bundle-container-outer.giveaway > div > div > div > div.bundle-time').each((_idx, el) => {
			const date = $(el).text()
			exp.push(date)
		});

		postTitles = postTitles.map((e,i) => [e[0],e[1],exp[i]])
		postTitles = postTitles.filter((e) => !(e[2].includes('expired')) && (e[0].includes('Steam') || e[0].includes('Epic Games')))

		return postTitles
	} catch (error) {
		throw error;
	}
};

cron.schedule('0 0 * * *', () => {
	getPostTitles()
    	.then((postTitles) => games = postTitles);
	console.log('updated games list 24hrs later'+games);
  });

// Handling GET / request
app.get('/', (req, res) => {
	console.log("new request"+games)
	res.render('index', {title:"Free Games Today" ,lists: games })
})

//app.get('/', (req, res) => {
//	res.sendFile(path.join(__dirname, 'index.html'))
//})

app.listen(3000, () => {
	console.log("Server is Running")
})

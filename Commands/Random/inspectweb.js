const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = async (context) => {
    const { m, text } = context;

    if (!text) return m.reply("Provide a valid web link to fetch! The bot will crawl the website and fetch it's html, CSS, JavaScript and any media embedded to it.");

    if (!/^https?:\/\//i.test(text)) {
        return m.reply("The URL must start with http:// or https://");
    }

    try {
        const response = await fetch(text);
        const html = await response.text();
        const $ = cheerio.load(html);

        const mediaFiles = [];
        $('img[src], video[src], audio[src]').each((i, element) => {
            let src = $(element).attr('src');
            if (src) {
                mediaFiles.push(src);
            }
        });

        const cssFiles = [];
        $('link[rel="stylesheet"]').each((i, element) => {
            let href = $(element).attr('href');
            if (href) {
                cssFiles.push(href);
            }
        });

        const jsFiles = [];
        $('script[src]').each((i, element) => {
            let src = $(element).attr('src');
            if (src) {
                jsFiles.push(src);
            }
        });

        await m.reply(`**Full HTML Content**:\n\n${html}`);

        if (cssFiles.length > 0) {
            await m.reply(`**CSS Files Found**:\n${cssFiles.join('\n')}`);
        } else {
            await m.reply("No external CSS files found.");
        }

        if (jsFiles.length > 0) {
            await m.reply(`**JavaScript Files Found**:\n${jsFiles.join('\n')}`);
        } else {
            await m.reply("No external JavaScript files found.");
        }

        if (mediaFiles.length > 0) {
            await m.reply(`**Media Files Found**:\n${mediaFiles.join('\n')}`);
        } else {
            await m.reply("No media files (images, videos, audios) found.");
        }

    } catch (error) {
        console.error(error);
        return m.reply("An error occurred while fetching the website content.");
    }
};
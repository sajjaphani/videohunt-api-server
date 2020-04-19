
const YouTube = require('./youtube');
const Facebook = require('./facebook');
const Vimeo = require('./vimeo');
const Ted = require('./ted');
const Dailymotion = require('./dailymotion');

const getProvider = (host) => {
    if (isYoutube(host)) {
        return new YouTube();
    }

    if (isFacebook(host)) {
        return new Facebook();
    }

    if (isVimeo(host)) {
        return new Vimeo();
    }

    if (isTed(host)) {
        return new Ted();
    }

    if (isDailymotion(host)) {
        return new Dailymotion();
    }

    return null;
};

const isYoutube = (host) => {
    return host === 'www.youtube.com' || host === 'youtube.com';
};

const isFacebook = (host) => {
    return host === 'www.facebook.com' || host === 'facebook.com';
};

const isVimeo = (host) => {
    return host === 'vimeo.com' || host === 'www.vimeo.com';
}

const isTed = (host) => {
    return host === 'www.ted.com' || host === 'ted.com';
};

const isDailymotion = (host) => {
    return host === 'www.dailymotion.com' || host === 'dailymotion.com';
};

const providers = ['YouTube', 'Facebook', 'Vimeo', 'Ted', 'Dailymotion'];
const getSupportedProviders = () => {
    return providers;
};

module.exports = { getProvider, getSupportedProviders };

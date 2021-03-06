import '../amp-redbull-player';

describes.realWin(
  'amp-redbull-player',
  {
    amp: {
      extensions: ['amp-redbull-player'],
    },
  },
  (env) => {
    let win, doc;
    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getRedBullElement(videoId) {
      const player = doc.createElement('amp-redbull-player');

      if (videoId) {
        player.setAttribute('data-param-videoid', videoId);
      }

      player.setAttribute('width', '222');
      player.setAttribute('height', '111');
      player.setAttribute('layout', 'responsive');

      doc.body.appendChild(player);
      return player.buildInternal().then(() => {
        player.layoutCallback();
        return player;
      });
    }

    describe('rendering', async () => {
      it('renders the Red Bull player', async () => {
        const player = await getRedBullElement(
          'rrn:content:videos:3965a26c-052e-575f-a28b-ded6bee23ee1:en-INT'
        );
        const playerIframe = player.querySelector('iframe');
        expect(playerIframe).to.not.be.null;
        expect(playerIframe.src).to.equal(
          'https://player.redbull.com/amp/amp-iframe.html?videoId=' +
            encodeURIComponent(
              'rrn:content:videos:3965a26c-052e-575f-a28b-ded6bee23ee1:en-INT'
            ) +
            '&skinId=com&ampTagId=rbvideo&locale=global'
        );
      });

      it('fails without videoId', () => {
        return getRedBullElement(null).should.eventually.be.rejectedWith(
          /The data-param-videoid attribute is required/
        );
      });

      it('removes iframe after unlayoutCallback', async () => {
        const player = await getRedBullElement(
          'rrn:content:videos:3965a26c-052e-575f-a28b-ded6bee23ee1:en-INT'
        );
        const playerIframe = player.querySelector('iframe');
        expect(playerIframe).to.not.be.null;

        const impl = await player.getImpl(false);
        impl.unlayoutCallback();
        expect(player.querySelector('iframe')).to.be.null;
        expect(impl.iframe_).to.be.null;
      });
    });
    describe('methods', async () => {
      let impl;
      beforeEach(async () => {
        const player = await getRedBullElement(
          'rrn:content:videos:3965a26c-052e-575f-a28b-ded6bee23ee1:en-INT'
        );
        impl = await player.getImpl(false);
      });

      it('is interactive', () => {
        expect(impl.isInteractive()).to.be.true;
      });

      it('supports platform', () => {
        expect(impl.supportsPlatform()).to.be.true;
      });

      it('does not pre-implement MediaSession API', () => {
        expect(impl.preimplementsMediaSessionAPI()).to.be.false;
      });

      it('does not pre-implement auto-fullscreen', () => {
        expect(impl.preimplementsAutoFullscreen()).to.be.false;
      });

      it('is not fullscreen', () => {
        expect(impl.isFullscreen()).to.be.false;
      });
    });
  }
);

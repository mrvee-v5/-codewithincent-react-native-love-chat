const React = require('react');
const renderer = require('react-test-renderer');

jest.mock('@shopify/flash-list', () => {
  return {
    FlashList: ({ data, renderItem }) => (
      <>
        {Array.isArray(data) ? data.map((item, index) => renderItem({ item, index })) : null}
      </>
    ),
  };
});

describe('Chat media refactor', () => {
  test('does not import built-in VideoCard/AudioCard in Chat bundle', () => {
    jest.isolateModules(() => {
      jest.mock('../components/media/VideoCard', () => {
        throw new Error('VideoCard should not be imported');
      });
      jest.mock('../components/media/AudioCard', () => {
        throw new Error('AudioCard should not be imported');
      });
      const Chat = require('../Chat').default;
      expect(typeof Chat).toBe('function');
    });
  });

  test('invokes renderVideoCard when provided for video messages', () => {
    const Chat = require('../Chat').default;
    const renderVideoCard = jest.fn(() => null);

    const user = { _id: 'u1', name: 'User' };
    const messages = [
      {
        _id: 'm1',
        text: '',
        createdAt: Date.now(),
        user,
        video: 'https://example.com/video.mp4',
      },
    ];

    renderer.create(
      React.createElement(Chat, {
        messages,
        user,
        onSend: jest.fn(),
        renderVideoCard,
      })
    );

    expect(renderVideoCard).toHaveBeenCalled();
    const args = renderVideoCard.mock.calls[0][0];
    expect(args.currentMessage).toBeDefined();
    expect(args.currentMessage.video || args.currentMessage.fileUrl).toBeTruthy();
  });

  test('invokes renderAudio when provided for audio messages', () => {
    const Chat = require('../Chat').default;
    const renderAudio = jest.fn(() => null);

    const user = { _id: 'u1', name: 'User' };
    const messages = [
      {
        _id: 'm2',
        text: '',
        createdAt: Date.now(),
        user,
        audio: 'https://example.com/audio.mp3',
      },
    ];

    renderer.create(
      React.createElement(Chat, {
        messages,
        user,
        onSend: jest.fn(),
        renderAudio,
      })
    );

    expect(renderAudio).toHaveBeenCalled();
    const args = renderAudio.mock.calls[0][0];
    expect(args.currentMessage).toBeDefined();
    expect(args.currentMessage.audio || args.currentMessage.fileUrl).toBeTruthy();
  });

  test('renders text-only messages identically without render props', () => {
    const Chat = require('../Chat').default;
    const user = { _id: 'u1', name: 'User' };
    const messages = [
      {
        _id: 'm3',
        text: 'Hello world',
        createdAt: Date.now(),
        user,
      },
    ];

    const tree = renderer
      .create(
        React.createElement(Chat, {
          messages,
          user,
          onSend: jest.fn(),
        })
      )
      .toJSON();

    expect(tree).toBeTruthy();
  });
});

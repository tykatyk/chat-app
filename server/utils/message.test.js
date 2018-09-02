var expect = require('expect');

var {generateMessage} = require('./message');

describe('generateMessaage', () => {
  it('should generate correct message object', () => {
    var from = 'Jen';
    var text = 'Some message';
    var obj = generateMessage(from, text);

    expect(obj.createdAt).toBeA('number');
    expect(obj).toInclude({from, text});
  });
});

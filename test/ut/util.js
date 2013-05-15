/**
 * Created with JetBrains WebStorm.
 * User: shenlixia01
 * Date: 13-5-8
 * Time: 下午4:36
 * To change this template use File | Settings | File Templates.
 */
var fs = require('fs'),
    path = require('path'),
    ROOT = path.join(__dirname, '../..')
        .replace(/\\/g, '/')
        .replace(/\/$/, '');
var fis = require('../../fis-kernel.js');
var  _ = fis.util,
    config = fis.config;
var expect = require('chai').expect;

function buf2arr(buf) {
    return Array.prototype.slice.call(buf);
}

describe('_.normalize(path1, [path2], [...])', function () {

    it('without argument', function () {
        expect(_.normalize('')).to.equal('');
        expect(_.normalize()).to.equal('');
    });

    it('1 argument of string', function () {
        expect(_('a')).to.equal('a');
    });

    it('1 argument of [Arguments Object]', function () {
        (function () {
            expect(_(arguments)).to.equal('a');
        })('a');
        (function () {
            expect(_(arguments)).to.equal('a/b');
        })('a', 'b');
    });

    it('2 or more arguments', function () {
        expect(_('a', 'b')).to.equal('a/b');
        expect(_('a', 'b', 'c')).to.equal('a/b/c');
        expect(_('a', 'b.js', 'c')).to.equal('a/b.js/c');
    });

    it('replace \\ width /', function () {
        expect(_('a\\b\\c')).to.equal('a/b/c');
        expect(_('a\\b/c')).to.equal('a/b/c');
        expect(_('a\\/b/c')).to.equal('a/b/c');
        expect(_('a\\//\\b/c')).to.equal('a/b/c');
    });

    it('remove all "/./"', function () {
        expect(_('a\\/./b\\c')).to.equal('a/b/c');
        expect(_('d\\e/f')).to.equal('d/e/f');
        expect(_('h/././i')).to.equal('h/i');
        expect(_('j/././k.')).to.equal('j/k.');
        expect(_('l/././m/.')).to.equal('l/m');
        expect(_('/./n./o/.')).to.equal('/n./o');
        expect(_('././.p/q/.')).to.equal('.p/q');
        expect(_('/./.r/s/.')).to.equal('/.r/s');
        expect(_('/t/.//.')).to.equal('/t');
    });

    it('remove all "xx/../"', function () {
        expect(_('a/../b/c')).to.equal('b/c');
        expect(_('a/a.b/../b/c')).to.equal('a/b/c');
        expect(_('../a')).to.equal('../a');
        expect(_('../../a')).to.equal('../../a');
        expect(_('a/../../b')).to.equal('../b');
        expect(_('/.a/b../..')).to.equal('/.a');
        expect(_('../.a/b/c d/e/../f/../g')).to.equal('../.a/b/c d/g');
    });

    it('remove last ' / '', function () {
        expect(_('a/')).to.equal('a');
        expect(_('/')).to.equal('/');
        expect(_('/.')).to.equal('/');
        expect(_('/.a/b../')).to.equal('/.a/b..');
    });

    it('special characters', function () {
        expect(_('a[/')).to.equal('a[');
        expect(_('!a?/')).to.equal('!a?');
        expect(_('a.js?b')).to.equal('a.js?b');
        expect(_('a.js', '?b=123')).to.equal('a.js/?b=123');
        expect(_('~a.js')).to.equal('~a.js');
    });

    it('alias', function () {
        expect(_.normalize('a/')).to.equal('a');
    });

    it('D:/', function () {
        expect(_.normalize('D:/')).to.equal('D:');
    });
});

describe('_.map(obj, callback, [merge])', function () {
    it('general', function () {
        var obj = {
            a: 1,
            b: {
                c: 2
            }
        };
        _.map(obj, function (key, value) {
            switch (key) {
                case 'a':
                    expect(value).to.equal(1);
                    break;
                case 'b':
                    expect(value).to.deep.equal({c: 2});
                    break;
                default :
                    expect(true).to.be.false;
            }
        });
    });
    it('merge', function () {
        var obj = {
                a: 1,
                b: {
                    c: 2
                }
            },
            ret = {
                b: {
                    d: 3
                },
                e: 'abc'
            };
        _.map(obj, ret, true);
        expect(ret).to.deep.equal({
            a: 1,
            b: {
                c: 2
            },
            e: 'abc'
        });
    });
});
//用fill填充字符串到长度len，pre表示将fill填充在前面，此时从后面向前取len的字符串作为结果
describe("_.pad(str, len, fill, [pre])", function () {
    it('normal-with fill', function () {
        var str = 'helloworld';
        var result = _.pad(str, 15, '--');
        expect(result).to.equal('helloworld-----');
    });
    it('normal--without fill', function () {
        var str = 'helloworld';
        var result = _.pad(str, 15);
        expect(result).to.equal('helloworld     ');
    });
    it('normal--pre', function () {
        //fill加在前面
        var str = 'helloworld';
        var result = _.pad(str, 11, '-', true);
        expect(result).to.equal('-helloworld');
    });
    it('normal--longer than len', function () {
        //fill加在前面
        var str = 'helloworld';
        var result = _.pad(str, 9, '-', true);
        expect(result).to.equal('helloworld');
    });
});

describe('_.merge(source, target)', function () {
    it('general', function () {
        var source = {
                a: {
                    b: '1',
                    c: {
                        d: 2,
                        e: [1, 2, 3, 4]
                    }
                },
                f: true,
                g: [1, 2, 3, 4]
            },
            target = {
                a: {
                    b: {
                        c: 1
                    },
                    c: 'hello',
                    f: 'abc'
                },
                g: [6, 7, 8]
            };
        expect(_.merge(source, target)).to.deep.equal({
            a: {
                b: {
                    c: 1
                },
                c: 'hello',
                f: 'abc'
            },
            f: true,
            g: [6, 7, 8]
        });
        expect(_.merge({a: 1}, [1])).to.deep.equal([1]);
        expect(_.merge({a: 1}, true)).to.be.true;
    });
});

describe('_.stringQuote(str, [quotes], [trim])', function () {
    it('1 param', function () {
        var str1 = ' "helloworld" ';
        var str2 = '"hello2"';
        var str3 = "\"hello3\"";
        var str4 = '"hello4';
        var str5 = '\'hello5\'';
        expect(_.stringQuote(str1)).to.deep.equal({
            origin: ' "helloworld" ',
            rest: "helloworld",
            quote: "\""
        });
        expect(_.stringQuote(str2)).to.deep.equal({
            origin: "\"hello2\"",
            rest: "hello2",
            quote: "\""
        });
        expect(_.stringQuote(str3)).to.deep.equal({
            origin: "\"hello3\"",
            rest: "hello3",
            quote: "\""
        });
        console.log(_.stringQuote(str3));
        expect(_.stringQuote(str5)).to.deep.equal({
            origin: "\'hello5\'",
            rest: "hello5",
            quote: "'"
        });
        expect(_.stringQuote(str4)).to.deep.equal({
            origin: '"hello4',
            rest: '"hello4',
            quote: ""
        });
    });

    it('quotes', function () {
        var str1 = '&hello1&';
        var str2 = '&hello2';
        expect(_.stringQuote(str1, '&')).to.deep.equal({
                origin: '&hello1&',
                rest: 'hello1',
                quote: "&"
            });
        expect(_.stringQuote(str2, '&')).to.deep.equal({
                origin: '&hello2',
                rest: '&hello2',
                quote: ""
            });
    });

    it('no trim', function () {
        var str1 = ' "hello1" ';
        var str2 = ' &hello2 ';
        expect(_.stringQuote(str1, null, false)).to.deep.equal({
                origin: ' "hello1" ',
                rest: " \"hello1\" ",
                quote: ""
            });
        expect(_.stringQuote(str2, '&', false)).to.deep.equal({
                origin: ' &hello2 ',
                rest: ' &hello2 ',
                quote: ""
            });
    });
    it('special characters',function(){
        var str1 = '([{^$|)?*+.,';
        expect(_.stringQuote(str1, null, false)).to.deep.equal({
        origin: '([{^$|)?*+.,',
        rest: "([{^$|)?*+.,",
        quote: ""
    });
    });
});

describe('_.getMimeType(ext)', function () {
    it('defined', function () {
        expect(_.getMimeType('.css')).to.equal('text/css');
        expect(_.getMimeType('js')).to.equal('text/javascript');
        expect(_.getMimeType('.txt')).to.equal('text/plain');
        expect(_.getMimeType('.json')).to.equal('application/json');
        expect(_.getMimeType('ico')).to.equal('image/x-icon');
        expect(_.getMimeType('.cur')).to.equal('application/octet-stream');
    });
    it('undefined', function () {
        expect(_.getMimeType('fuckie')).to.equal('application/x-fuckie');
    });
});

describe('_.realpath(path)', function () {
    it('file or dir exists', function () {
        expect(_.realpath(__filename)).to
            .equal(__filename.replace(/\\/g, '/'));
        expect(_.realpath(__dirname + '/')).to
            .equal(__dirname.replace(/\\/g, '/'));
        expect(_.realpath('.')).to
            .equal(process.cwd().replace(/\\/g, '/'));
        if (_.isWin()) {
            expect(_.realpath('/')).to.match(/^(?:\w:)?$/);
        } else {
            expect(_.realpath('/')).to.equal('/');
        }
    });
    it('not exists', function () {
        expect(_.realpath(__filename + '.abc')).to.be.false;
        expect(_.realpath('')).to.be.false;
        expect(_.realpath(false)).to.be.false;
        expect(_.realpath()).to.be.false;
    });
});

describe('_.realpathSafe(path)', function () {
    it('file or dir exists', function () {
        expect(_.realpathSafe(__filename)).to
            .equal(__filename.replace(/\\/g, '/'));
        expect(_.realpathSafe(__dirname)).to
            .equal(__dirname.replace(/\\/g, '/'));
        expect(_.realpathSafe('.')).to
            .equal(process.cwd().replace(/\\/g, '/'));
    });
    it('not exists', function () {
        expect(_.realpathSafe(__filename + '.abc')).to
            .equal((__filename + '.abc').replace(/\\/g, '/'));
    });
});

describe('_.isAbsolute(path)', function () {
    //todo
});

describe('_.isFile(path)', function () {
    it('file', function () {
        expect(_.isFile(__filename)).to.be.true;
        expect(_.isFile(__filename + '/a.js')).to.be.false;
    });
    it('dir', function () {
        expect(_.isFile(__dirname)).to.be.false;
        expect(_.isFile(__dirname + '/..')).to.be.false;
    });
});

describe('_.isDir(path)', function () {
    it('file', function () {
        expect(_.isDir(__filename)).to.be.false;
        expect(_.isDir(__filename + '/a.js')).to.be.false;
    });
    it('dir', function () {
        expect(_.isDir(__dirname)).to.be.true;
        expect(_.isDir(__dirname + '/..')).to.be.true;
        expect(_.isDir(__dirname + '/~abc')).to.be.false;
    });
});
describe('_.mtime(path)', function () {
    it('file or dir exists', function () {
        expect(_.mtime(__filename)).to.be.an.instanceOf(Date);
        expect(_.mtime(__dirname)).to.be.an.instanceOf(Date);
    });
    it('file does not exists', function () {
        expect(_.mtime(__filename + '.test')).to.equal(0);
    });
});

describe('_.touch(path, mtime)', function () {
    it('file or dir exists', function () {
        var stat = fs.statSync(__filename),
            mtime = stat.mtime,
            mtimeNum = mtime.getTime();
        expect(_.mtime(__filename).getTime()).to.equal(mtimeNum);
        _.touch(__filename, mtimeNum + 1000);
        expect(_.mtime(__filename).getTime()).to.equal(mtimeNum + 1000);
        _.touch(__filename, mtime);
        expect(_.mtime(__filename).getTime()).to.equal(mtimeNum);
    });

    it('file does not exist.', function () {
        var time = new Date(),
            file = __filename + '.tmp',
            timeNum = Math.floor(time.getTime() / 1000) * 1000 - 1000;
        time.setTime(time.getTime() - 1000);
        if(fs.existsSync(file)){
            fs.unlinkSync(file);
        }
        expect(_.exists(file)).to.be.false;
        _.touch(file, time);
        expect(_.exists(file)).to.be.true;
        expect(fs.readFileSync(file)).to.have.length(0);
        expect(_.mtime(file).getTime()).to.equal(timeNum);
        _.del(file);
        expect(_.exists(file)).to.be.false;
    });
});

describe('_.isWin()', function () {
    it('general', function () {
        expect(_.isWin()).to.equal(path.sep === '\\');
    });
});

describe('_.isTextFile(path)', function () {
    it('without config', function () {
        expect(_.isTextFile('a.js')).to.be.true;
        expect(_.isTextFile('a.js.css')).to.be.true;
        expect(_.isTextFile('a.js.csss')).to.be.false;
        expect(_.isTextFile('')).to.be.false;
        expect(_.isTextFile()).to.be.false;
    });
    it('with config', function () {
        expect(_.isTextFile('a.js.csss')).to.be.false;
        config.set('project.fileType.abc', ['csss']);
        expect(_.isTextFile('a.js.csss')).to.be.false;
        config.set('project.fileType.text', ['csss']);
        expect(_.isTextFile('a.js.csss')).to.be.true;
        config.set({});
        expect(_.isTextFile('a.js.csss')).to.be.false;
    });
});

describe('_.isImageFile(path)', function () {
    it('without config', function () {
        expect(_.isImageFile('a.png')).to.be.true;
        expect(_.isImageFile('a.js.gif')).to.be.true;
        expect(_.isImageFile('a.js.jpee')).to.be.false;
        expect(_.isImageFile('')).to.be.false;
        expect(_.isImageFile()).to.be.false;
    });
    it('with config', function () {
        expect(_.isImageFile('a.js.jpee')).to.be.false;
        config.set('project.fileType.bcd', ['jpee']);
        expect(_.isImageFile('a.js.jpee')).to.be.false;
        config.set('project.fileType.image', ['jpee']);
        expect(_.isImageFile('a.js.jpee')).to.be.true;
        config.set({});
        expect(_.isImageFile('a.js.jpee')).to.be.false;
    });
});

describe('_.md5(str)', function () {
    //md5('fis') = 37ab815c056b5c5f600f6ac93e486a78
    //md5('') = d41d8cd98f00b204e9800998ecf8427e
    it('general', function () {
        expect(_.md5('fis')).to.equal('37ab815');
        expect(_.md5('')).to.equal('d41d8cd');
        expect(_.md5).to.throw(TypeError);
    });
    it('with config', function () {
        config.set('project.md5Length', 10);
        expect(_.md5('fis')).to.equal('37ab815c05');
        expect(_.md5('')).to.equal('d41d8cd98f');
        expect(_.md5).to.throw(TypeError);
        config.set('project.md5Length', 7);
        expect(_.md5('fis')).to.equal('37ab815');
        expect(_.md5('')).to.equal('d41d8cd');
        expect(_.md5).to.throw(TypeError);
    });
    it('use buffer', function () {
        var buf = new Buffer('hello world');
        expect(_.md5(buf)).to.equal('5eb63bb');
    });
});

describe('_.base64(data)', function () {
    it('string', function () {
        expect(_.base64('fis')).to.equal('Zmlz');
        expect(_.base64('')).to.equal('');
        expect(_.base64()).to.equal('');
    });
    it('buffer', function () {
        var root = _(__dirname, 'util/base64'),
            source = fs.readFileSync(root + '/logo.gif'),
            data = fs.readFileSync(root + '/logo.txt').toString();
        expect(_.base64(source)).to.equal(data);
    });
});

describe('_.mkdir(path1, [mode])', function () {
    it('general', function () {
        var dir = _(__dirname) + '/mkdir';
        expect(_.isDir(dir)).to.be.false;
        _.mkdir(dir);
        expect(_.isDir(dir)).to.be.true;
        _.del(dir);
        expect(_.isDir(dir)).to.be.false;
    });
    it('recursive', function () {
        var dir = _(__dirname) + '/mkdir/a/b/c/d';
        expect(_.isDir(dir)).to.be.false;
        _.mkdir(dir);
        expect(_.isDir(dir)).to.be.true;
        _.del(__dirname + '/mkdir');
        expect(_.isDir(dir)).to.be.false;
        expect(_.isDir(__dirname + '/mkdir')).to.be.false;
        expect(_.isDir(__dirname + '/mkdir/a')).to.be.false;
        expect(_.isDir(__dirname + '/mkdir/a/b')).to.be.false;
        expect(_.isDir(__dirname + '/mkdir/a/b/c')).to.be.false;
        expect(_.isDir(__dirname + '/mkdir/a/b/c/d')).to.be.false;
    });
});

describe('_.readBuffer(buffer)', function () {
    it('utf-8 with bom', function () {
        var buf = new Buffer([
            0xef, 0xbb, 0xbf, 0x68,
            0x65, 0x6C, 0x6C, 0x6F,
            0x20, 0x77, 0x6F, 0x72,
            0x6C, 0x64
        ]);
        expect(_.readBuffer(buf)).to.equal('hello world');
    });
    it('utf-8 without bom', function () {
        var buf = new Buffer([
            0x68, 0x65, 0x6C, 0x6C,
            0x6F, 0x20, 0x77, 0x6F,
            0x72, 0x6C, 0x64
        ]);
        expect(_.readBuffer(buf)).to.equal('hello world');
    });
    it('gbk', function () {
        var buf = new Buffer([0xC4, 0xE3, 0xBA, 0xC3]);
        expect(_.readBuffer(buf)).to.equal('你好');
    });
});

describe('_.read(path)', function () {
    var root = _(__dirname, 'util/encoding');
    it('encoding utf-8 without bom', function () {
        expect(_.read(root + '/utf8.txt')).to
            .equal('你好,©我是€无bom文件');
    });
    it('encoding utf-8 with bom', function () {
        expect(_.read(root + '/utf8-bom.txt')).to
            .equal('你好,©我是€utf8-bom文件');
        var data = fs.readFileSync(root + '/utf8-bom.txt'),
            buffer = new Buffer('\uFEFF你好,©我是€utf8-bom文件');
        expect(data).to.deep.equal(buffer);
    });
    it('encoding gbk', function () {
        expect(_.read(root + '/gbk.txt')).to
            .equal('你好,我是gbk');
    });
    it('read from binary file', function () {
        var file = _(__dirname, 'util/img/data.png'),
            data = fs.readFileSync(file),
            read = _.read(file);
        expect(read).to.deep.equal(data);
    });
});

describe('_.write()', function () {
    it('general', function () {
        var testfile = _(__dirname, 'write.tmp');
        _.write(testfile, '你好, fis。');
        var data = buf2arr(fs.readFileSync(testfile)),
            exp = [
                0xe4, 0xbd, 0xa0, 0xe5,
                0xa5, 0xbd, 0x2c, 0x20,
                0x66, 0x69, 0x73, 0xe3,
                0x80, 0x82
            ];
        expect(data).to.deep.equal(exp);
        expect(_.exists(testfile)).to.be.true;
        _.del(testfile);
        expect(_.exists(testfile)).to.be.false;
    });

    it('gbk encoding', function () {
        var testfile = _(__dirname, 'write.tmp');
        _.write(testfile, '你好, fis。', 'gbk');
        var data = buf2arr(fs.readFileSync(testfile)),
            exp = [
                0x00c4, 0x00e3, 0x00ba, 0x00c3,
                0x002c, 0x0020, 0x0066, 0x0069,
                0x0073, 0x00a1, 0x00a3
            ];
        expect(data).to.deep.equal(exp);
        expect(_.exists(testfile)).to.be.true;
        _.del(testfile);
        expect(_.exists(testfile)).to.be.false;
    });

    it('auto mkdir', function () {
        var testfile = _(__dirname, 'mkdir/write.tmp'),
            content = '你好, fis。';
        expect(_.exists(__dirname + '/mkdir')).to.be.false;
        expect(_.exists(testfile)).to.be.false;
        _.write(testfile, content);
        expect(_.exists(__dirname + '/mkdir')).to.be.true;
        expect(_.exists(testfile)).to.be.true;
        expect(_.read(testfile)).to.equal(content);
        _.del(__dirname + '/mkdir');
        expect(_.exists(__dirname + '/mkdir')).to.be.false;
        expect(_.exists(testfile)).to.be.false;
    });

    it('append', function () {
        var testfile = _(__dirname, 'write.tmp'),
            content = '你好, fis。';
        _.write(testfile, '你好, fis。');
        expect(_.read(testfile)).to.equal(content);
        _.write(testfile, '123');
        expect(_.read(testfile)).to.equal('123');
        _.write(testfile, '你好', null, true);
        expect(_.read(testfile)).to.equal('123你好');
        _.del(testfile);
    });
});


describe('_.filter(str, [include], [exclude])',function(){
    it('1 param',function(){
        expect(_.filter('hello')).to.be.true;
    });
    it('include',function(){
        expect(_.filter('hello','llo')).to.be.true;
        expect(_.filter('hello','llo1')).to.be.false;
    });
    it('exclude',function(){
        expect(_.filter('hello',null,'llo')).to.be.false;
        expect(_.filter('hello',null,'llo1')).to.be.true;
    });
    it('exclude&include',function(){
        expect(_.filter('hello','he','llo')).to.be.false;
        expect(_.filter('hello','he1','llo')).to.be.false;
        expect(_.filter('hello','he','llo1')).to.be.false;//???以he结尾/he$/??? todo
        expect(_.filter('hello','llo','llo1')).to.be.true;
    });
});

describe('_find(rPath, [include], [exclude])',function(){
//    it('invalid path',function(){
//        try{
//            _.find('./invalidPath')
//        }catch(e){
//            expect(1).to.equal(1);
//        }
//
//    });
    it('normal',function(){
        var imgs = _.find(__dirname+'/util/img');
        for(var i=0;i<imgs.length;i++){
            imgs[i] = path.normalize(imgs[i]);
        }
        expect(imgs).to.deep.equal(
            [
                path.normalize(__dirname+'/util/img/data.png'),
                path.normalize(__dirname+'/util/img/test.png')
            ].sort()
        );
    });

    it('empty dir',function(){
        var imgs = _.find(__dirname+'/util/emptyDir');
        expect(imgs.length).to.equal(0);
    });
    it('file path',function(){
        var img = _.find(__dirname+'/util/img/data.png');
        img = path.normalize(img);
        expect(img).to.equal(path.normalize(__dirname+'/util/img/data.png'));
    });
    it('include',function(){
        var file = _.find(__dirname+'/util/base64/','gif');
        file = path.normalize(file);
        expect(file).to.equal(path.normalize(__dirname+'/util/base64/logo.gif'));

        var file = _.find(__dirname+'/util/base64/','xsl');
        expect(file).to.deep.equal([]);
    });

    //include和exclude都是通配符，如**.js，所以转化为正则以后应该是/js$/这种样子的，所以就不考虑exclude和include同时存在的情况了，太无聊了
    it('exclude',function(){
        var file = _.find(__dirname+'/util/base64/',null,'*.gif');
        file = path.normalize(file);
        expect(file).to.equal(path.normalize(__dirname+'/util/base64/logo.txt'));

        var imgs = _.find(__dirname+'/util/img/',null,'gif');
        for(var i=0;i<imgs.length;i++){
            imgs[i] = path.normalize(imgs[i]);
        }
        expect(imgs).to.deep.equal(
            [
                path.normalize(__dirname+'/util/img/data.png'),
                path.normalize(__dirname+'/util/img/test.png')
            ].sort()
        );
    });

});

describe('_.del(rPath, include, exclude)',function(){
    it('remove file',function(){
        var tmpdir = __dirname+"/tmp/tmp2";
        _.mkdir(tmpdir);
        fs.writeFileSync(tmpdir+'/a.txt','hello world');
        expect(_.isDir(tmpdir)).to.be.true;
        expect(_.del(__dirname+"/tmp")).to.be.true;
        expect(_.isDir(tmpdir)).to.be.false;
    });

    it('remove folder',function(){
        var tmpdir = __dirname+"/tmp/tmp2";
        _.mkdir(tmpdir);
        expect(_.isDir(tmpdir)).to.be.true;
        _.del(__dirname+"/tmp/");
        expect(_.isDir(__dirname+"/tmp/")).to.be.false;
    });

    it('include',function(){
        var tmpdir = __dirname+"/tmp/tmp2";
        _.mkdir(tmpdir);
        fs.writeFileSync(tmpdir+'/a.js','hello world');
        fs.writeFileSync( __dirname+"/tmp/a.txt",'hello world');
        fs.writeFileSync(__dirname+"/tmp/b.js",'hello world');
        expect(_.isDir(tmpdir)).to.be.true;
        _.del(__dirname+"/tmp/",'js');
        expect(fs.existsSync(__dirname+"/tmp/a.txt")).to.be.true;
        expect(fs.existsSync(__dirname+"/tmp/tmp2/a.js")).to.be.false;
        expect(fs.existsSync(__dirname+"/tmp/b.js")).to.be.false;
        _.del(__dirname+"/tmp/");
        expect(_.isDir(__dirname+"/tmp/")).to.be.false;
    });

    it('exclude',function(){
        var tmpdir = __dirname+"/tmp/tmp2";
        _.mkdir(tmpdir);
        fs.writeFileSync(tmpdir+'/a.js','hello world');
        fs.writeFileSync( __dirname+"/tmp/a.txt",'hello world');
        fs.writeFileSync(__dirname+"/tmp/b.js",'hello world');
        expect(_.isDir(tmpdir)).to.be.true;
        _.del(__dirname+"/tmp/",null,'js');
        expect(fs.existsSync(__dirname+"/tmp/a.txt")).to.be.false;
        expect(fs.existsSync(__dirname+"/tmp/tmp2/a.js")).to.be.true;
        expect(fs.existsSync(__dirname+"/tmp/b.js")).to.be.true;
        _.del(__dirname+"/tmp/");
        expect(_.isDir(__dirname+"/tmp/")).to.be.false;
    });

});

describe('_.copy(rSource, target, include, exclude, uncover, move)',function(){
    it('general',function(){
        var source = __dirname+'/copy/dir1';
        var target = __dirname+'/copy/dir2';
        _.mkdir(source);
        _.mkdir(target);
        fs.writeFileSync(source+'/index.js','hello world');
        fs.writeFileSync( source+"/file.js",'hello world');
        fs.writeFileSync(target+"/index.js",'hello world2');
        _.copy(source,target);
        expect(fs.existsSync(target+"/file.js")).to.be.true;
        expect(fs.existsSync(target+"/index.js")).to.be.true;
        _.del(target);
        _.del(source);
    });
    it('move',function(){
        var source = __dirname+'/copy/dir1';
        var target = __dirname+'/copy/dir2';
        _.mkdir(source);
        _.mkdir(target);
        fs.writeFileSync(source+'/index.js','hello world');
        fs.writeFileSync( source+"/file.js",'hello world');
        fs.writeFileSync(target+"/index.js",'hello world2');
        _.copy(source,target,null,null,null,true);
        expect(fs.existsSync(target+"/file.js")).to.be.true;
        expect(fs.existsSync(target+"/index.js")).to.be.true;
        expect(fs.existsSync(source+"/index.js")).to.be.false;
        expect(fs.existsSync(source+"/file.js")).to.be.false;
        _.del(target);
        _.del(source);
    });
    it('include',function(){
        var source = __dirname+'/copy/dir1';
        var target = __dirname+'/copy/dir2';
        _.mkdir(source);
        _.mkdir(target);
        fs.writeFileSync(source+'/index.js','hello world');
        fs.writeFileSync( source+"/file.txt",'hello world');
        fs.writeFileSync(target+"/index1.js",'hello world2');
        _.copy(source,target,'txt',null,null,true);
        expect(fs.existsSync(target+"/file.txt")).to.be.true;
        expect(fs.existsSync(target+"/index1.js")).to.be.true;
        expect(fs.existsSync(target+"/index.js")).to.be.false;
        _.del(target);
        _.del(source);
    });
    it('exclude',function(){
        var source = __dirname+'/copy/dir1';
        var target = __dirname+'/copy/dir2';
        _.mkdir(source);
        _.mkdir(target);
        fs.writeFileSync(source+'/index.js','hello world');
        fs.writeFileSync( source+"/file.txt",'hello world');
        fs.writeFileSync(target+"/index1.js",'hello world2');
        _.copy(source,target,null,'txt',null,true);
        expect(fs.existsSync(target+"/file.txt")).to.be.false;
        expect(fs.existsSync(target+"/index1.js")).to.be.true;
        expect(fs.existsSync(target+"/index.js")).to.be.true;
        expect(fs.existsSync(source+"/index.js")).to.be.false;
        _.del(target);
        _.del(source);
    });
    //同名不覆盖，且源文件不删除
    it('uncover&&move',function(){
        var source = __dirname+'/copy/dir1';
        var target = __dirname+'/copy/dir2';
        _.mkdir(source);
        _.mkdir(target);
        fs.writeFileSync(source+'/index.js','hello world');
        fs.writeFileSync(source+"/file.js",'hello world');
        fs.writeFileSync(target+"/index.js",'hello world2');
        _.copy(source,target,null,null,true,true);
        expect(fs.existsSync(target+"/file.js")).to.be.true;
        expect(fs.existsSync(target+"/index.js")).to.be.true;
        expect(fs.existsSync(source+"/index.js")).to.be.true;
        _.del(target);
        _.del(source);
    });
});

//后缀相关的信息
describe('_ext(str)',function(){
    it('general',function(){
        expect(_.ext(__filename).ext).to.equal('.js');
        expect(_.ext(__filename).filename).to.equal('util');
        expect(_.ext(__filename).basename).to.equal('util.js');
        expect(_.ext(__filename).dirname).to.equal(_(__dirname));
        expect(_.ext(__filename).rest).to.equal(_(__dirname)+'/util');
    });

    it('no /',function(){
        expect(_.ext('a.js').ext).to.equal('.js');
        expect(_.ext('a.js').filename).to.equal('a');
        expect(_.ext('a.js').basename).to.equal('a.js');
        expect(_.ext('a.js').dirname).to.equal('');
        expect(_.ext('a.js').rest).to.equal('a');
    });

    it('no .',function(){
        expect(_.ext('a').ext).to.equal('');
        expect(_.ext('a').filename).to.equal('a');
        expect(_.ext('a').basename).to.equal('a');
        expect(_.ext('a').dirname).to.equal('');
        expect(_.ext('a').rest).to.equal('a');
    });

});
//get请求中的query
describe('_query(str)',function(){
    it('general',function(){
        var q = _.query('http://www.baidu.com?type=q&q=2');
        expect(q.origin,'http://www.baidu.com?type=q&q=2');
        expect(q.query,'?type=q&q=2');
        expect(q.rest,'http://www.baidu.com');
    });

    it('no ?',function(){
        var q = _.query('http://www.baidu.com');
        expect(q.origin,'http://www.baidu.com');
        expect(q.query,'');
        expect(q.rest,'http://www.baidu.com');
    });

});

describe('_pathinfo(path)',function(){
    it('array',function(){
        var p = _.pathinfo('a','a.js');
        expect(p.ext).to.equal('.js');
        expect(p.filename).to.equal('a');
        expect(p.basename).to.equal('a.js');
        expect(p.dirname).to.equal('a');
        expect(p.rest).to.equal('a/a');
    });
    it('object',function(){
        var p = _.pathinfo(['a','a.js']);
        expect(p.ext).to.equal('.js');
        expect(p.filename).to.equal('a');
        expect(p.basename).to.equal('a.js');
        expect(p.dirname).to.equal('a');
        expect(p.rest).to.equal('a/a');
    });
    it('string',function(){
        var p = _.pathinfo('a/a.js');
        expect(p.ext).to.equal('.js');
        expect(p.filename).to.equal('a');
        expect(p.basename).to.equal('a.js');
        expect(p.dirname).to.equal('a');
        expect(p.rest).to.equal('a/a');

    });

});

describe('_camelcase(str)',function(){
    it('general',function(){
        var str = 'str_replace.js';
        expect(_.camelcase(str)).to.equal('StrReplace.js');
        str = 'str-replace.js';
        expect(_.camelcase(str)).to.equal('StrReplace.js');
        str = 'strreplace.js';
        expect(_.camelcase(str)).to.equal('Strreplace.js');
    });

});

describe('_parseUrl(url, opt)',function(){
    it('general',function(){
        var url = 'http://localhost:8080/fis/test';
        var res = _.parseUrl(url);
        expect(res).to.deep.equal(
            {
                host:'localhost',
                port:'8080',
                path:'/fis/test',
                method:'GET',
                agent:false
            }
        );

        url = 'https://www.google.com?q=hello';
        var res = _.parseUrl(url);
        expect(res).to.deep.equal(
            {
                host:'www.google.com',
                port:443,
                path:'/?q=hello',
                method:'GET',
                agent:false
            }
        );
    });
    it('opt',function(){
        url = 'https://www.google.com?q=hello';
        var res = _.parseUrl(url,{
            'path':'/fis/client',
            'port':8888,
            'method':'POST',
            'agent':'chrme'
        });
        expect(res).to.deep.equal(
            {
                'path':'/fis/client',
                'port':8888,
                'method':'POST',
                'host':'www.google.com',
                'agent':'chrme'
            }
        );
    });
});


describe('_upload(url, opt, data, file, callback)',function(){

});


describe('_download(url, callback, extract, opt)',function(){

});

describe('_.readJSON(path)',function(){
    it('general-readJson',function(){
        var path = _(__dirname)+"/util/json/json.json";
        var res = _.readJSON(path);
        expect(res).to.deep.equal({
            "a":"test1",
            "b":"test2",
            "arr":{
                "arr1":"1"
            }
        });
    });

    it('general-readJson',function(){
        var path = _(__dirname)+"/util/json/json.json";
        var res = _.readJSON(path);
        expect(res).to.deep.equal({
            "a":"test1",
            "b":"test2",
            "arr":{
                "arr1":"1"
            }
        });
    });
    it('gbk',function(){
        var path = _(__dirname)+"/util/json/gbk.json";
        var res = _.readJSON(path);
        expect(res).to.deep.equal({
            "你好" : "中文",
            "string" : "hello world",
            "boolean" : true,
            "number" : 123,
            "null" : null,
            "array" : ["中文", "hello world", true, 123, null],
            "object" : {
                "你好" : "中文",
                "string" : "hello world",
                "boolean" : true,
                "number" : 123,
                "null" : null,
                "array" : ["中文", "hello world", true, 123, null],
                "object" : {
                    "你好" : "中文",
                    "string" : "hello world",
                    "boolean" : true,
                    "number" : 123,
                    "null" : null,
                    "array" : ["中文", "hello world", true, 123, null]
                }
            }
        });
    });
    it('utf8',function(){
        var path = _(__dirname)+"/util/json/utf8.json";
        var res = _.readJSON(path);
        expect(res).to.deep.equal({
            "你好" : "中文",
            "string" : "hello world",
            "boolean" : true,
            "number" : 123,
            "null" : null,
            "©" : "€",
            "array" : ["中文", "hello world", true, 123, null, "©", "€"],
            "object" : {
                "你好" : "中文",
                "string" : "hello world",
                "boolean" : true,
                "number" : 123,
                "null" : null,
                "©" : "€",
                "array" : ["中文", "hello world", true, 123, null, "©", "€"],
                "object" : {
                    "你好" : "中文",
                    "string" : "hello world",
                    "boolean" : true,
                    "number" : 123,
                    "null" : null,
                    "©" : "€",
                    "array" : ["中文", "hello world", true, 123, null, "©", "€"]
                }
            }
        });

        var path = _(__dirname)+"/util/json/utf8-bom.json";
        var res = _.readJSON(path);
        expect(res).to.deep.equal({
            "你好" : "中文",
            "string" : "hello world",
            "boolean" : true,
            "number" : 123,
            "null" : null,
            "©" : "€",
            "array" : ["中文", "hello world", true, 123, null, "©", "€"],
            "object" : {
                "你好" : "中文",
                "string" : "hello world",
                "boolean" : true,
                "number" : 123,
                "null" : null,
                "©" : "€",
                "array" : ["中文", "hello world", true, 123, null, "©", "€"],
                "object" : {
                    "你好" : "中文",
                    "string" : "hello world",
                    "boolean" : true,
                    "number" : 123,
                    "null" : null,
                    "©" : "€",
                    "array" : ["中文", "hello world", true, 123, null, "©", "€"]
                }
            }
        });
    });

});


describe('_.isUtf8', function () {
    it('gbk', function () {
        var bytes =  buf2arr(fs.readFileSync(__dirname+'/util/encoding/gbk.txt'));
        expect(_.isUtf8(bytes)).to.be.false;
    });
    it('utf8', function () {
        var bytes =  buf2arr(fs.readFileSync(__dirname+'/util/encoding/utf8.txt'));
        expect(_.isUtf8(bytes)).to.be.true;
    });
    it('utf8-bom', function () {
        var bytes =  buf2arr(fs.readFileSync(__dirname+'/util/encoding/utf8-bom.txt'));
        expect(_.isUtf8(bytes)).to.be.true;
    });
});

describe('_.glob(pattern, [str])', function(){
    it('general', function(){
        expect(_.glob('/*.js', '/abc.js')).to.be.true;
        expect(_.glob('/*.js', '/abc.js.css')).to.be.false;
        expect(_.glob('/*.js', '/abc.JS')).to.be.true;
        expect(_.glob('/?.js', '/abc.js')).to.be.false;
        expect(_.glob('/??.js', '/abc.js')).to.be.false;
        expect(_.glob('/?.js', '/a.js')).to.be.true;
        expect(_.glob('/??.js', '/ab.js')).to.be.true;
    });
    it('**', function(){
        expect(_.glob('**.js', 'as/d.a/abc.js')).to.be.true;
        expect(_.glob('**.js', 'as/d.a/abc.js.css')).to.be.false;
        expect(_.glob('**.js', 'as/d.a/abc.js/')).to.be.false;
        expect(_.glob('a/**/*.js', 'as/d.a/abc.js')).to.be.false;
        expect(_.glob('a/**/*.js', 'a/s/d.a/abc.js')).to.be.true;
        expect(_.glob('a/**/?.js', 'a/s/d.a/abc.js')).to.be.false;
        expect(_.glob('a/**/?.js', 'a/s/d.a/c.js')).to.be.true;
    });
    it('*', function(){
        expect(_.glob('*/*.js', 'da.js')).to.be.false;
        expect(_.glob('*/*.js', '/adfda.js')).to.be.true;
        expect(_.glob('*/*.js', 'db/dsaa.js')).to.be.true;
        expect(_.glob('/*/*.js', 'bdsf/aa.js')).to.be.false;
        expect(_.glob('/*/*.js', '/bdsf/.js')).to.be.true;
        expect(_.glob('/*/*.js', '/bdsf/.js.css')).to.be.false;
        expect(_.glob('/*/*.js', '/bdsf/.js.JS')).to.be.true;
        expect(_.glob('/*/*.js', '/ba/asd.js')).to.be.true;
        expect(_.glob('/*/*.js', '//asd.js')).to.be.true;
        expect(_.glob('/*/*.js', 'aaa/bbbs/ad.js')).to.be.true;
    });
});
var fontnik = require('../index.js');
var assert = require('assert');
var zlib = require('zlib');
var fs = require('fs');
var path = require('path');
var zdata = fs.readFileSync(__dirname + '/fixtures/range.0.256.pbf');
var Protobuf = require('pbf');
var Glyphs = require('./format/glyphs');
var UPDATE = process.env.UPDATE;

// function nobuffer(key, val) {
//     return key !== '_buffer' && key !== 'bitmap' ? val : undefined;
// }
//
// function jsonEqual(key, json) {
//     if (UPDATE) fs.writeFileSync(__dirname + '/expected/'+key+'.json', JSON.stringify(json, null, 2));
//     assert.deepEqual(json, require('./expected/'+key+'.json'));
// }
//
// fontnik.register_fonts(path.resolve(__dirname + '/../fonts/'), { recurse: true });
//
// describe('glyphs', function() {
//     var data;
//     before(function(done) {
//         zlib.inflate(zdata, function(err, d) {
//             assert.ifError(err);
//             data = d;
//             done();
//         });
//     });
//
//     it('serialize', function(done) {
//         // On disk fixture generated with the following code.
//         if (UPDATE) {
//             fontnik.range({
//                 fontstack:'Open Sans Regular',
//                 start: 0,
//                 end: 256
//             }, function(err, zdata) {
//                 if (err) throw err;
//                 fs.writeFileSync(__dirname + '/fixtures/range.0.256.pbf', zdata);
//                 done();
//             });
//         }
//         var glyphs = new fontnik.Glyphs(data);
//         var vt = new Glyphs(new Protobuf(new Uint8Array(glyphs.serialize())));
//         var json = JSON.parse(JSON.stringify(vt, nobuffer));
//         jsonEqual('range', json);
//         done();
//     });
//
//     it('range', function(done) {
//         var glyphs = new fontnik.Glyphs();
//         glyphs.range('Open Sans Regular', '0-256', fontnik.getRange(0, 256), function(err) {
//             assert.ifError(err);
//             var vt = new Glyphs(new Protobuf(new Uint8Array(glyphs.serialize())));
//             var json = JSON.parse(JSON.stringify(vt, nobuffer));
//             jsonEqual('range', json);
//             done();
//         });
//     });
//
//     // Render a long range of characters which can cause segfaults
//     // with V8 arrays ... not sure yet why.
//     it('longrange', function(done) {
//         var glyphs = new fontnik.Glyphs();
//         glyphs.range('Open Sans Regular', '0-1024', fontnik.getRange(0, 1024), function(err) {
//             assert.ifError(err);
//             done();
//         });
//     });
//
//     it('range (chars input)', function(done) {
//         var glyphs = new fontnik.Glyphs();
//         glyphs.range('Open Sans Regular', 'a-and-z', [('a').charCodeAt(0), ('z').charCodeAt(0)], function(err) {
//             assert.ifError(err);
//             var vt = new Glyphs(new Protobuf(new Uint8Array(glyphs.serialize())));
//             var json = JSON.parse(JSON.stringify(vt, nobuffer));
//             jsonEqual('chars', json);
//             done();
//         });
//     });
//
//     it('range typeerror fontstack', function(done) {
//         var glyphs = new fontnik.Glyphs();
//         assert.throws(function() {
//             glyphs.range(0, '0-256', fontnik.getRange(0, 256), function() {});
//         }, /fontstack must be a string/);
//         done();
//     });
//
//     it('range typeerror range', function(done) {
//         var glyphs = new fontnik.Glyphs();
//         assert.throws(function() {
//             glyphs.range('Open Sans Regular', 0, fontnik.getRange(0, 256), function() {});
//         }, /range must be a string/);
//         done();
//     });
//
//     it('range typeerror chars', function(done) {
//         var glyphs = new fontnik.Glyphs();
//         assert.throws(function() {
//             glyphs.range('Open Sans Regular', '0-256', 'foo', function() {});
//         }, /chars must be an array/);
//         done();
//     });
//
//     it('range typeerror callback', function(done) {
//         var glyphs = new fontnik.Glyphs();
//         assert.throws(function() {
//             glyphs.range('Open Sans Regular', '0-256', fontnik.getRange(0, 256), '');
//         }, /callback must be a function/);
//         done();
//     });
//
//     it('range for fontstack with 0 matching fonts', function(done) {
//         var glyphs = new fontnik.Glyphs();
//         glyphs.range('doesnotexist', '0-256', fontnik.getRange(0, 256), function(err) {
//             assert.ok(err);
//             assert.equal("Error: Failed to find face 'doesnotexist' in font set 'doesnotexist'", err.toString());
//             done();
//         });
//     });
//
//     it('range for fontstack with 1 bad font', function(done) {
//         var glyphs = new fontnik.Glyphs();
//         glyphs.range('Open Sans Regular, doesnotexist', '0-256', fontnik.getRange(0, 256), function(err) {
//             assert.ok(err);
//             assert.equal("Error: Failed to find face 'doesnotexist' in font set 'Open Sans Regular, doesnotexist'", err.toString());
//             done();
//         });
//     });
//
//     // Should error because start is < 0
//     it('getRange error start < 0', function() {
//         assert.throws(function() {
//             fontnik.getRange(-128, 256);
//         }, 'Error: start must be a number from 0-65535');
//     });
//
//     // Should error because end < start
//     it('getRange error end < start', function() {
//         assert.throws(function() {
//             fontnik.getRange(256, 0);
//         }, 'Error: start must be less than or equal to end');
//     });
//
//     // Should error because end > 65535
//     it('getRange error end > 65535', function() {
//         assert.throws(function() {
//             fontnik.getRange(0, 65536);
//         }, 'Error: end must be a number from 0-65535');
//     });
// });
//
// describe('codepoints', function() {
//     it('basic scanning: open sans', function() {
//         var glyphs = new fontnik.Glyphs();
//         var cp = glyphs.codepoints('Open Sans Regular');
//         assert.equal(cp.length, 882);
//     });
//     it('basic scanning: fira sans', function() {
//         var glyphs = new fontnik.Glyphs();
//         var cp = glyphs.codepoints('Fira Sans Medium');
//         assert.equal(cp.length, 789);
//     });
//     it('basic scanning: fira sans + open sans', function() {
//         var glyphs = new fontnik.Glyphs();
//         var cp = glyphs.codepoints('Fira Sans Medium, Open Sans Regular');
//         assert.equal(cp.length, 1021);
//     });
//     it('invalid font face', function() {
//         var glyphs = new fontnik.Glyphs();
//         assert.throws(function() {
//             glyphs.codepoints('foo-bar-invalid');
//         });
//     });
// });
//
// describe('faces', function() {
//     it('list faces', function() {
//         var faces = fontnik.faces();
//         assert.deepEqual(faces, ['Fira Sans Medium', 'Open Sans Regular']);
//     });
// });

var expected = [{"family_name":"Fira Sans","style_name":"Medium","points":[32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,402,508,509,510,511,536,537,538,539,567,700,710,711,728,729,730,731,732,733,768,769,770,771,772,774,775,776,778,779,780,787,788,806,807,900,901,902,904,905,906,908,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,931,932,933,934,935,936,937,938,939,940,941,942,943,944,945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1107,1108,1109,1110,1111,1112,1113,1114,1115,1116,1117,1118,1119,1122,1123,1138,1139,1140,1141,1168,1169,1170,1171,1174,1175,1176,1177,1178,1179,1180,1181,1184,1185,1186,1187,1194,1195,1196,1197,1198,1199,1200,1201,1202,1203,1206,1207,1208,1209,1210,1211,1216,1217,1218,1227,1228,1231,1232,1233,1234,1235,1236,1237,1238,1239,1240,1241,1242,1243,1244,1245,1246,1247,1250,1251,1252,1253,1254,1255,1256,1257,1258,1259,1260,1261,1262,1263,1264,1265,1266,1267,1268,1269,1270,1271,1272,1273,1308,1309,1316,1317,1318,1319,7808,7809,7810,7811,7812,7813,7922,7923,8048,8049,8050,8051,8052,8053,8054,8055,8056,8057,8058,8059,8060,8061,8112,8113,8118,8120,8121,8122,8123,8128,8134,8136,8137,8138,8139,8144,8145,8146,8147,8150,8151,8152,8153,8154,8155,8160,8161,8162,8163,8166,8167,8168,8169,8170,8171,8182,8184,8185,8186,8187,8199,8200,8203,8204,8205,8206,8207,8210,8211,8212,8213,8216,8217,8218,8220,8221,8222,8224,8225,8226,8230,8240,8249,8250,8260,8304,8308,8309,8310,8311,8312,8313,8314,8315,8316,8317,8318,8320,8321,8322,8323,8324,8325,8326,8327,8328,8329,8330,8331,8332,8333,8334,8364,8470,8482,8486,8494,8531,8532,8533,8534,8535,8536,8537,8538,8539,8540,8541,8542,8543,8592,8593,8594,8595,8596,8597,8598,8599,8600,8601,8678,8679,8680,8681,8682,8706,8709,8710,8719,8721,8722,8725,8729,8730,8734,8747,8776,8800,8804,8805,8901,8998,8999,9000,9003,9166,9647,9674,10145,11013,11014,11015,57344,57345,57346,57347,64257,64258,65279,127760]}];
describe('load', function() {
    it('loads', function(done) {
        var firasans = path.resolve(__dirname + '/../fonts/firasans-medium/FiraSans-Medium.ttf');
        assert.ok(fs.existsSync(firasans));
        fontnik.load(firasans, function(err, faces) {
            assert.ifError(err);
            assert.deepEqual(faces,expected);
            done();
        });
    });
});

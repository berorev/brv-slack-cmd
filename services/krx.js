// 실시간시세(국문)    http://asp1.krx.co.kr/servlet/krx.asp.XMLSise?code=단축종목코드
// 실시간시세(영문)    http://asp1.krx.co.kr/servlet/krx.asp.XMLSiseEng?code=단축종목코드
// 공시정보(국,영문)    http://asp1.krx.co.kr/servlet/krx.asp.DisList4MainServlet?code=단축코드&gubun=K (K:국문/E:영문)
// 재무종합(국문)        http://asp1.krx.co.kr/servlet/krx.asp.XMLJemu?code=단축종목코드
// 재무종합(영문)        http://asp1.krx.co.kr/servlet/krx.asp.XMLJemuEng?code=단축종목코드
// 재무종합2(국문)      http://asp1.krx.co.kr/servlet/krx.asp.XMLJemu2?code=단축종목코드
// 재무종합3(국문)      http://asp1.krx.co.kr/servlet/krx.asp.XMLJemu3?code=단축종목코드
// 텍스트                    http://asp1.krx.co.kr/servlet/krx.asp.XMLText?code=단축종목코드

// view-source:http://asp1.krx.co.kr/servlet/krx.asp.XMLSise?code=150900
// view-source:http://asp1.krx.co.kr/servlet/krx.asp.XMLJemu?code=150900
// view-source:http://asp1.krx.co.kr/servlet/krx.asp.XMLJemu2?code=150900
// view-source:http://asp1.krx.co.kr/servlet/krx.asp.XMLJemu3?code=150900
// view-source:http://asp1.krx.co.kr/servlet/krx.asp.XMLText?code=150900

const util = require('util');
const axios = require('axios').default;
const xml2js = require('xml2js');

const parseXml = util.promisify(xml2js.parseString);

function toNumber(s, fractionDigits) {
  const n = Number(s.replace(/,/g, ''));
  return Number.isInteger(fractionDigits) ? n.toFixed(fractionDigits) : n;
}

class PriceService {
  static async getPrice(code) {
    return axios
      .get(`http://asp1.krx.co.kr/servlet/krx.asp.XMLSise?code=${code}`)
      .then((resp) => parseXml(resp.data.trim()))
      .then((xml) => {
        const stockInfo = xml.stockprice.TBL_StockInfo[0].$;
        return {
          current: stockInfo.CurJuka, // 현재가: 4,480
          changes: PriceService.formatChanges(stockInfo), // 전일대비: -110 -2.40%
          previousClose: stockInfo.PrevJuka, // 전일: 4,590
          volume: stockInfo.Volume, // 거래량: 37,340
          money: stockInfo.Money // 거래대금: 167m
        };
      });
  }

  static toPercent(n, d, fractionDigits) {
    const percentage = (toNumber(n) / toNumber(d)) * 100;
    return Number.isInteger(fractionDigits) ? percentage.toFixed(fractionDigits) : percentage;
  }

  static formatChanges(stockInfo) {
    // DungRak : 1 - 상한, 2 - 상승, 3 - 보합, 4 - 하한, 5 - 하락
    let sign = '';
    if (stockInfo.DungRak === '1' || stockInfo.DungRak === '2') {
      sign = '+';
    } else if (stockInfo.DungRak === '4' || stockInfo.DungRak === '5') {
      sign = '-';
    }
    const changesPercent = PriceService.toPercent(stockInfo.Debi, stockInfo.PrevJuka, 2);
    return `${sign}${stockInfo.Debi} (${sign}${changesPercent}%)`;
  }
}

class FinancialService {
  static async getFinancials(code) {
    return axios
      .get(`http://asp1.krx.co.kr/servlet/krx.asp.XMLJemu3?code=${code}`)
      .then((resp) => parseXml(resp.data.trim()))
      .then((xml) => ({
        incomeStatement: FinancialService.parseIncomeStatement(xml),
        balanceSheet: FinancialService.parseBalanceSheet(xml)
      }));
  }

  static parseIncomeStatement(xml) {
    const sonIkK = xml.financialTotal.TBL_SonIkK[0];
    const periods = FinancialService.parsePeriods(sonIkK);

    let totalRevenues = [];
    let operatingIncomes = [];
    let netIncome = [];
    sonIkK.TBL_SonIkK_data.forEach((data) => {
      const attrs = data.$;
      if (attrs.hangMok0 === '매출액') {
        totalRevenues = [attrs.year1Money0, attrs.year2Money0, attrs.year3Money0];
      } else if (attrs.hangMok2 === '영업이익(손실)') {
        operatingIncomes = [attrs.year1Money2, attrs.year2Money2, attrs.year3Money2];
      } else if (attrs.hangMok5 === '총당기순이익') {
        netIncome = [attrs.year1Money5, attrs.year2Money5, attrs.year3Money5];
      }
    });

    return {
      periods,
      totalRevenues, // 매출액: [322.4]
      operatingIncomes, // 영업이익: [15.3]
      netIncome // 당기순이익: [9.8]
    };
  }

  static parseBalanceSheet(xml) {
    const daechaK = xml.financialTotal.TBL_DaeChaK[0];
    const periods = FinancialService.parsePeriods(daechaK);

    let assets = [];
    let liabilities = [];
    let equity = [];
    daechaK.TBL_DaeChaK_data.forEach((data) => {
      const attrs = data.$;
      if (attrs.hangMok2 === '자산총계') {
        assets = [attrs.year1Money2, attrs.year2Money2, attrs.year3Money2];
      } else if (attrs.hangMok5 === '부채총계') {
        liabilities = [attrs.year1Money5, attrs.year2Money5, attrs.year3Money5];
      } else if (attrs.hangMok9 === '자본총계') {
        equity = [attrs.year1Money9, attrs.year2Money9, attrs.year3Money9];
      }
    });

    return {
      periods,
      assets, // 자산: [459.6]
      liabilities, // 부채: [245.2]
      equity // 자본: [214.4]
    };
  }

  static parsePeriods(node) {
    const p1 = `y${node.$.year0}/${node.$.month0}`;
    const p2 = `y${node.$.year1}/${node.$.month1}`;
    const p3 = `y${node.$.year2}/${node.$.month2}`;
    return [p1, p2, p3];
  }
}

async function getStockInfo(code) {
  return Promise.all([PriceService.getPrice(code), FinancialService.getFinancials(code)]).then(
    ([price, financials]) => {
      let result = `현재가: ${price.current}원 ${price.changes}\n`;
      result += `|&nbsp;|${financials.incomeStatement.periods.join('|')}|`;
      result += `|---|${Array(financials.incomeStatement.periods.length).fill('---')}|`;
      result += `|매출액|${financials.incomeStatement.totalRevenues.join('|')}|`;
      result += `|영업이익|${financials.incomeStatement.operatingIncomes.join('|')}|`;
      result += `|당기순이익|${financials.incomeStatement.netIncome.join('|')}|`;
      return result;
    }
  );
}

module.exports = {
  getStockInfo,
  getPrice: PriceService.getPrice,
  getFinancials: FinancialService.getFinancials
};

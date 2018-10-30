/*  Amortization & Interest Calculator 2.0   Oct 30, 2018
 *  copyright © 2016, 2018 Joe Golembieski, SoftMoon-WebWare
 *  http://softmoon-webware.com/
 *
		This program is free software: you can redistribute it and/or modify
		it under the terms of the GNU General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version.
		The original copyright information must remain intact.

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		GNU General Public License for more details.

		You should have received a copy of the GNU General Public License
		along with this program.  If not, see <http://www.gnu.org/licenses/>   */

//  character-encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 180   max-line-length: 2400


//rounds  x  to  dp  decimal places.
if (typeof Math.roundTo !== 'function')
	Math.roundTo=function(x, dp)  {return Math.round(x*Math.pow(10,dp))/Math.pow(10,dp);}


if (!SoftMoon ||  typeof SoftMoon !== 'object')  var SoftMoon={WebWare: {}};



//all $values passed in to this constructor and the setter-functions should be Numeric
SoftMoon.WebWare.Amortization_InterestCalculator=function($amount, $cycles_loaned, $apr, $downpayment, $cycles_per_year)  { //all these constructor arguments are optional
//                                              =function($formElement)  //  alternative format using DOM form element to associate with this calculator instance
	if (this===SoftMoon.WebWare)  throw new Error('SoftMoon.WebWare.Amortization_InterestCalculator() is a constructor, not a function.');
	if (typeof arguments[0] == "object"  &&  arguments[0] instanceof Element  &&  arguments[0].nodeName=='FORM')  {
		this.form=arguments[0];
		var inps=this.form.elements;
		$amount=         inps.total_price     && parseFloat(inps.total_price.value);
		$cycles_loaned=  inps.cycles_loaned   && parseFloat(inps.cycles_loaned.value);
		$apr=            inps.apr             && parseFloat(inps.apr.value / ((inps.apr.className.search( /\bpercent\b/ )>=0) ? 100 : 1));
		$downpayment=    inps.downpayment     && parseFloat(inps.downpayment.value / ((inps.downpayment.className.search( /\bpercent\b/ )>=0) ? 100 : 1));
		$cycles_per_year=inps.cycles_per_year && parseFloat(inps.cycles_per_year.value);  }

	var _total_price_=Math.roundTo($amount||0, this.currency.decimalPlaces),
			_downpayment_,
			_downpayment_rate_;
	function calcDownRate()  {
		if (_total_price_!==0)  _downpayment_rate_=_downpayment_/_total_price_;
		else  _downpayment_rate_=0;  }

	if ($downpayment<1 && $downpayment>(-1))  {    //if $downpayment is a percentage value then it becomes the downpayment rate
		this._flag_fixedDownPayment=false;
		_downpayment_rate_=$downpayment||0;
		_downpayment_=Math.roundTo(_total_price_*_downpayment_rate_, this.currency.decimalPlaces);  }
	else  {    //if $downpayment is a negative value <0 then it is considered a "cash-back" or "cash-loan-addition" to the cost of the item sold
		_downpayment_=Math.roundTo($downpayment||0, this.currency.decimalPlaces),
		this._flag_fixedDownPayment=true;
		calcDownRate();  }
	this.cycles_loaned=parseInt($cycles_loaned||0);
	this.apr=$apr||0;
	this.cycles_per_year=$cycles_per_year||12;  //defaults to Monthly Payments
	Object.defineProperties(this, {

		form: {enumerable: false,  writable: true},

		summaryTable: {enumerable: false,  writable: true},

		amortizationTable: {enumerable: false,  writable: true},

		amortization_data: {enumerable: false,  writable: true},

		_flag_fixedDownPayment: {enumerable: false,  writable: true},

		cycles_loaned: {enumerable: true,  writable: true},

		apr: {enumerable: true,  writable: true},

		cycles_per_year: {enumerable: true,  writable: true},

		total_price: { enumerable: true,
			get: function() {return _total_price_;},
			set: function($p)  { _total_price_=Math.roundTo($p, this.currency.decimalPlaces);
				if (this._flag_fixedDownPayment)  calcDownRate();
				else  _downpayment_=Math.roundTo(_total_price_*_downpayment_rate_, this.currency.decimalPlaces);  }  },

		downpayment: { enumerable: true,
			get: function() {return _downpayment_;},
			set: function($d)  { _downpayment_=Math.roundTo($d, this.currency.decimalPlaces);   calcDownRate();
				this._flag_fixedDownPayment=true;  }  },

		downpayment_rate: { enumerable: true,
			get: function() {return _downpayment_rate_;},
			set: function($d)  { _downpayment_rate_=$d;  _downpayment_=Math.roundTo(_downpayment_rate_*_total_price_, this.currency.decimalPlaces);
				this._flag_fixedDownPayment=false;  }  },

		loan_amount: { enumerable: true,
			get: function() {return _total_price_-_downpayment_;},
			set: function($l) {_downpayment_=_total_price_-Math.roundTo($l, this.currency.decimalPlaces);  calcDownRate();}  },

		cycle_percentage_rate: { enumerable: true,
			get: function() {return this.apr/this.cycles_per_year;},
			set: function($r) {this.apr=$r*this.cycles_per_year;}  },

		cyclical_payment: { enumerable: true,
			get: function() {return this.loan_amount * (this.cycle_percentage_rate / (1 - Math.pow(1 + this.cycle_percentage_rate, -(this.cycles_loaned))));},
			set: function($cp) {this.loan_amount=
						Math.roundTo($cp/(this.cycle_percentage_rate / (1 - Math.pow(1 + this.cycle_percentage_rate, -(this.cycles_loaned)))), this.currency_decimalPlaces);}  },

		total_interest: { enumerable: true,
			get: function() {return Math.roundTo(this.cyclical_payment*this.cycles_loaned-this.loan_amount, this.currency.decimalPlaces);}  }  });

	if (this.form)  {this.bindForm(this.form);  this.updateForm();}  }




SoftMoon.WebWare.Amortization_InterestCalculator.prototype.bindForm=function($form)  {
	if (typeof $form != "object"  ||  !($form instanceof Element)  ||  $form.nodeName!="FORM")
		throw new Error('"bindForm()" of an instance of SoftMoon.WebWare.Amortization_InterestCalculator requires a DOM form Element to be passed in.')
	this.form=$form;
	$form.calculator=this;
	var p, inps=$form.elements;
	for (p in inps)  {if (this[inps[p].name])  inps[p].onchange=function() {this.form.calculator.updateForm(this);}};
	if (inps.show_Amortization)  inps.show_Amortization.onclick=function() {this.form.calculator.popupAmortization();};  }




SoftMoon.WebWare.Amortization_InterestCalculator.prototype.updateForm=function($inp)  {
	var p, fInps=($inp) ? $inp.form.elements : this.form.elements;
	if ($inp)  this[$inp.name] = parseFloat($inp.value) / (($inp.className.search( /\bpercent\b/ )>=0) ? 100 : 1);
	for (p in this)  {  if (fInps[p]  &&  fInps[p]!==$inp)
		fInps[p].value = this[p] * ((fInps[p].className.search( /\bpercent\b/ )>=0) ? 100 : 1);  }  }




SoftMoon.WebWare.Amortization_InterestCalculator.prototype.popupAmortization=function($container, $_flag_archiveData, $_flag_includeSummary)  {
	if (typeof $_flag_includeSummary == 'undefined')  $_flag_includeSummary=this.popupAmortization._flag_includeSummary;
	if (typeof $_flag_archiveData == 'undefined')  $_flag_archiveData=this.popupAmortization._flag_archiveData;
	if (typeof $container == 'undefined')  $container=this.popupAmortization.defaultContainer;
	if (typeof $container == "string")  $container=document.getElementById($container);
	if (typeof $container != "object"  ||  !($container instanceof Element  ||  $container instanceof DocumentFragment))
		throw new Error('popupAmortization of an instance of SoftMoon.WebWare.Amortization_InterestCalculator requires a:\n • DOM Element or\n • Document Fragment\n as a container to hold a generated Amortization Table.\n None provided or found.');
	var old, tbl=this.buildAmortizationTable($_flag_includeSummary, $_flag_archiveData, $container.ownerDocument);
	if ($container.hasChildNodes()  &&  (old= $container.getElementsByClassName(this.amortizationTable_className_attribute)[0]))
		$container.replaceChild(tbl, old);
	else  $container.appendChild(tbl);  }


//The defaultContainer to hold the newly created Amortization Table may be:
//  • a string name of the Element's id
//  • a DOM Element capable of childNodes
//  • a Document Fragment
SoftMoon.WebWare.Amortization_InterestCalculator.prototype.popupAmortization.defaultContainer='amortization';
SoftMoon.WebWare.Amortization_InterestCalculator.prototype.popupAmortization._flag_includeSummary=true;
SoftMoon.WebWare.Amortization_InterestCalculator.prototype.popupAmortization._flag_archiveData=true;




SoftMoon.WebWare.Amortization_InterestCalculator.prototype.buildSummaryTable=function($document)  {
	var doc=$document||document,
			table=doc.createElement('table'),
			tbody, tr, td, tx, duration;
	function buildRow(text, data)  {
		tr=doc.createElement('tr');  tbody.appendChild(tr);
		td=doc.createElement('th');  tr.appendChild(td);  td.scope='row';
		td.appendChild(doc.createTextNode(text));
		td=doc.createElement('td');  tr.appendChild(td);
		td.appendChild(doc.createTextNode(data));  }

	this.summaryTable=doc.createDocumentFragment()
	this.summaryTable.appendChild(table);
	table.className=this.summaryTable_className_attribute;
	table.summary=this.summaryTable_summary_attribute;
	tbody=table.appendChild(doc.createElement('tbody'));

	if (this.downpayment!=0)  {
		buildRow(this.summaryTable_text.totalPrice, this.currency(this.total_price));
		buildRow( (this.downpayment>0) ? this.summaryTable_text.downpayment[0] : this.summaryTable_text.downpayment[1],
						 this.currency(this.downpayment)+" ["+(this.downpayment_rate*100).toFixed(4)+"%]" );  }

	buildRow(this.summaryTable_text.loan_amount, this.currency(this.loan_amount));

	buildRow(this.summaryTable_text.totalInterest, this.currency(this.total_interest));

	switch(Math.round(this.cycles_per_year))  {
		case 12: duration=this.summaryTable_text.cycleDuration_A[0];  break;
		case 52: duration=this.summaryTable_text.cycleDuration_A[1];  break;
		default: duration=this.summaryTable_text.cycleDuration_A[2];  };
	buildRow(duration, this.currency(this.cyclical_payment));

	buildRow(this.summaryTable_text.apr, (this.apr*100).toFixed(4)+"%");

	switch(Math.round(this.cycles_per_year))  {
		case 12: duration=this.summaryTable_text.cycleDuration_B[0];  break;
		case 52: duration=this.summaryTable_text.cycleDuration_B[1];  break;
		default: duration=this.summaryTable_text.cycleDuration_B[2];  };
	buildRow(this.summaryTable_text.duration,
					 this.cycles_loaned.toString() + " "+duration+" [" + Math.roundTo(this.cycles_loaned/this.cycles_per_year, 4) + " "+this.summaryTable_text.years+"]");

	return this.summaryTable;  }


SoftMoon.WebWare.Amortization_InterestCalculator.prototype.summaryTable_className_attribute='loan_summary';
SoftMoon.WebWare.Amortization_InterestCalculator.prototype.summaryTable_summary_attribute='loan payment summary';
SoftMoon.WebWare.Amortization_InterestCalculator.prototype.summaryTable_text= {   // change ↓↑ for non-English language
	totalPrice: 'Total Price',
	downpayment: ['Down-payment', 'Cash Back'],   // [positive values, negative values]
	loan_amount: 'Loan Amount',
	totalInterest: 'Total Interest Paid',
	apr: 'Annual Percentage Rate',
	duration: 'Loan Duration',
	cycleDuration_A: ["Monthly Payment", "Weekly Payment", "Cyclical Payment"],
	cycleDuration_B: ["Months", "Weeks", "Cycles"],
	years: "Years"  };




SoftMoon.WebWare.Amortization_InterestCalculator.prototype.buildAmortizationTable=function($_flag_includeSummary, $_flag_archiveData, $document)  { //  $_flag_ operands are Boolean
	var doc=$document||document,
			table=doc.createElement('table'),
			thead, tbody, tfoot, tr, td, tx,
			balance=this.loan_amount,
			cpr=this.cycle_percentage_rate,
			payment=this.cyclical_payment,
			duration, cycle, interest, total_interest=0, principle;
	function buildHeadCell(text)  {
		td=tr.appendChild(doc.createElement('th'));  td.scope='col';
		td.appendChild(doc.createTextNode(text));  }
	function buildAuxRow(section, content)  {
		tr=section.appendChild(doc.createElement('tr'));
		td=tr.appendChild(doc.createElement('td'));  td.colSpan='5';
		td.appendChild(content);  }
	function buildBodyCell(text)  {
		td=tr.appendChild(doc.createElement('td'));
		td.appendChild(doc.createTextNode(text));  }
	function forceNode(text)  { return (typeof text == 'object'  &&  (text instanceof Element  ||  text instanceof Node  ||  text instanceof DocumentFragment))  ?
			text
		: doc.createTextNode(text);  }

	if ($_flag_archiveData)  this.amortization_data=new Array;
	this.amortizationTable=doc.createDocumentFragment();
	this.amortizationTable.appendChild(table);
	table.className=this.amortizationTable_className_attribute;
	table.summary=this.amortizationTable_summary_attribute;
	tx=table.appendChild(doc.createElement('caption'));
	tx.appendChild(forceNode(this.amortizationTable_text.caption));
	thead=table.appendChild(doc.createElement('thead'));
	tbody=table.appendChild(doc.createElement('tbody'));
	tfoot=table.appendChild(doc.createElement('tfoot'));

	//here we build the table head
	if ($_flag_includeSummary)  buildAuxRow(thead, this.buildSummaryTable());
	tr=thead.appendChild(doc.createElement('tr'));
	switch(Math.round(this.cycles_per_year))  {
		case 12: duration=this.amortizationTable_text.cycleDuration[0];  break;
		case 52: duration=this.amortizationTable_text.cycleDuration[1];  break;
		default: duration=this.amortizationTable_text.cycleDuration[2];  };
	buildHeadCell(duration);
	buildHeadCell(this.amortizationTable_text.interest);
	buildHeadCell(this.amortizationTable_text.totalInterest);
	buildHeadCell(this.amortizationTable_text.principle);
	buildHeadCell(this.amortizationTable_text.balance);

	//here we build the table body
	for (cycle=1; cycle<=this.cycles_loaned; cycle++)  {
		interest=balance*cpr;
		total_interest+=interest;
		principle=payment-interest;
		balance-=principle;
		if ($_flag_archiveData)  this.amortization_data.push(
			{interest: interest,  totalInterest: total_interest,  principle: principle,  balance: balance}  );
		tr=tbody.appendChild(doc.createElement('tr'));
		tr.className=(cycle%2) ? "odd" : "even";
		buildBodyCell(cycle.toString());
		buildBodyCell(this.currency(interest));
		buildBodyCell(this.currency(total_interest));
		buildBodyCell(this.currency(principle));
		buildBodyCell(this.currency(balance));  }

	//here we build the table footer
	if (this.amortizationTable_text.footer)
		buildAuxRow(tfoot, forceNode(this.amortizationTable_text.footer));
	buildAuxRow(tfoot, doc.createTextNode('generated by SoftMoon-WebWare'));

	return this.amortizationTable;  }


SoftMoon.WebWare.Amortization_InterestCalculator.prototype.amortizationTable_className_attribute='amortization';
SoftMoon.WebWare.Amortization_InterestCalculator.prototype.amortizationTable_summary_attribute='loan payment details';
SoftMoon.WebWare.Amortization_InterestCalculator.prototype.amortizationTable_text= {   // change ↑↓ for non-English language
	caption: 'Loan Payment Details',               //caption and
	footer: null,                                  //  footer may be: •string of text  •document Node  •document fragment
	cycleDuration: ["Month", "Week", "Cycle"],
	interest: 'Interest Paid',
	totalInterest: 'Total Interest Paid',
	principle: 'Principle Paid',
	balance: 'Balance Due'  }

// you may edit, or replace → (respecting the note below), the following function to reflect proper currency text-output for your region:
SoftMoon.WebWare.Amortization_InterestCalculator.prototype.currency=function(x) {return this.currency.symbol+x.toFixed(this.currency.decimalPlaces)}
SoftMoon.WebWare.Amortization_InterestCalculator.prototype.currency.symbol="$";   //  €  £  ¤  ¥  etc.
SoftMoon.WebWare.Amortization_InterestCalculator.prototype.currency.decimalPlaces=2;  //note the calculator depends on the existence of this property

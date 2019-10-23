'use strict';

const formTemplate = mailData => {
  return (
    `<h3>Дані про відправника:</h3>` +
    `<p>Ім'я: ${mailData.firstName || 'Не вказано'}<br />` +
    `Прізвище: ${mailData.secondName || 'Не вказано'}<br />` +
    `Назва компанії: ${mailData.companyName || 'Не вказано'}<br />` +
    `Номер телефону: ${mailData.phone || 'Не вказано'}<br />` +
    `E-mail: ${mailData.email || 'Не вказано'}<br />` +
    `Посада: ${mailData.position || 'Не вказано'}<br />` +
    `Місто: ${mailData.city || 'Не вказано'}<br /><br />` +
    `Повідомлення:<br />` +
    `${mailData.message || 'Не вказано'}</p>`
  );
};

const verifyMailTemplate = (token, unsubKey) => {
  return (
    `<table style="max-width: 600px; margin-left: auto; margin-right: auto;">
	  <tr style="width: 100%;">
	    <td>
	    	<img style='width: 100%;' src='logo@news.suntown' alt='sun-town'/>
        <h2 style="font-family: 'Arial'; font-weight: 300">

        </h2>	
      <p style="font-family: 'Arial'; font-weight: 300">
				Спасибо, что подписались на новости Сантаун Украина.
				Пожалуйста, подтвердите свой e-mail адрес. 
      </p>
	    </td>	
	  </tr>
	  <tr>
	  	<td style=' justify-content: center; width: 100%; text-align: center;'> 
        <a href='https://suntown-ukraine.com/newsletter/verify?verificationToken=${token}'>
          <button style='background: #86B82A; border: 0; width: 200px; color: white;
          font-size: 20px; outline: 0; cursor: pointer; font-family: Arial; border-radius: 10px; margin-top: 25px; cursor: pointeк;'>
            Подтвердить почту
          </button>
        </a>
	  	</td>
	  </tr>
	  <tr>
	  	<td style='display: flex; justify-content: center'>
	  		<p style="margin: 0; width: 100%; text-align: center" >+38 (050) 533 78 57</p>
	  	</td>
	  </tr>
	  <tr>
	  <td style='display: flex; justify-content: center'>
	  	<p style="margin: 0; width: 100%; text-align: center">sales@suntown-ukraine.com</p>
	  </td>
	  </tr>		
	  <tr>
	  	<td style='display: flex; justify-content: center'> 
      <a 
        style='margin: 0; width: 100%; text-align: center; color:red' 
        href='http://suntown-ukraine.com/newsletter/unsubscribe?unsubscriptionKey=${unsubKey}'>
		  		Отписаться
		  	</a>
		 </td>
	  </tr>
	</table>`
  );
};

const newsletterTemplate = (article, unsubKey) => {
  return (
    `<table style="max-width: 600px; margin-left: auto; margin-right: auto;">
		<tr style="width: 100%">
			<td>
				<img style='width: 100%;' src='cid:logo@news.suntown' alt='sun-town' />
        <h2 style="font-family: 'Arial'; font-weight: 300">
          Уважаемый клиент!
          Вашему вниманию новые электронные решения для оптимизации торговли!
        </h2>
				<img style='width: 100%;' src='cid:mainImage@news.suntown' alt='sun-town' />
        <h2 style="font-weight: 300; font-family: 'Arial';">
          ${article.title}
        </h2>
        <p style="font-family: 'Arial'; font-weight: 300">
          ${article.description}
        </p>
			</td>
    </tr>
    <tr>
	  	<td style='justify-content: center; width: 100%; text-align: center;'> 
	  		<a href='https://suntown-ukraine.com/post/${article.url}'>
					<button style='background: #86B82A; border: 0; width: 200px; color: white;
					font-size: 20px; outline: 0; cursor: pointer; font-family: Arial; border-radius: 10px; margin-top: 10px;'>
						Перейти к новости
					</button>
				</a>
	  	</td>
	  </tr>
		<tr>
			<td style='display: flex; justify-content: center'>
				<p
					style="padding-top: 20px; font-family: 'Arial'; font-weight: 300; margin: 0; width: 100%; text-align: center">
					+38 (050) 533 78 57</p>
			</td>
		</tr>
		<tr>
			<td style='justify-content: center; text-align: center'>
				<p style="font-family: 'Arial'; font-weight: 300; margin: 0; width: 100%; text-align: center">
					sales@suntown-ukraine.com</p>
			</td>
		</tr>
		<tr>
			<td style='justify-content: center; text-align: center'>
				<a style="margin: 0; width: 100%; font-family: 'Arial'; text-align: center; color: #86B82A;"
					href='https://suntown-ukraine.com/'>
					https://suntown-ukraine.com/
				</a>
			</td>
		</tr>
		<tr>
	  	<td style='justify-content: center; text-align: center'> 
      <a style='margin: 0; width: 100%; text-align: center; color:red' 
        href='https://suntown-ukraine.com/newsletter/unsubscribe?unsubscriptionKey=${unsubKey}'>
		  	Отписаться
		  </a>
		 </td>
	  </tr>
	</table>`
  );
};

module.exports = {
  formTemplate,
  verifyMailTemplate,
  newsletterTemplate
};
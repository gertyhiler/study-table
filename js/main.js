(() => {
  function createElement(tagName = '', classess = []) {
    const element = document.createElement(tagName);
    element.classList.add(...classess);
    return element;
  }

  const tbody = document.createElement('tbody');

  function createForm() {
    const inputContainerClasses = ['input-group', 'mb-2'];
    const inputClasses = ['form-control', 'mr-1'];

    function createInput(id, type, placeholder = '') {
      const element = createElement('input', inputClasses);

      element.id = id;
      element.type = type;
      if (placeholder !== '') element.placeholder = placeholder;

      return element;
    }
    const form = createElement('form', ['container', 'mb-3', 'pt-4']);

    const inputTopContainer = createElement('div', inputContainerClasses);
    const inputButtonContainer = createElement('div', inputContainerClasses);

    const labelDate = createElement('label', ['input-group-prepend', 'input-group-text']);

    const inputFullName = createInput('name', 'text', 'ФИО');
    const inputDate = createInput('date', 'date');
    const inputYear = createInput('year', 'number', 'Год начала обучения');
    const inputFaculty = createInput('faculty', 'text', 'Факультет');

    const button = createElement('button', ['btn', 'btn-success']);

    labelDate.setAttribute('for', 'date');
    inputYear.setAttribute('min', '2000');

    labelDate.innerText = 'Дата рождения';

    button.textContent = 'Добавить студента';

    inputTopContainer.append(inputFullName, labelDate, inputDate);
    inputButtonContainer.append(inputYear, inputFaculty);
    form.append(inputTopContainer, inputButtonContainer, button);

    return {
      inputFullName,
      inputDate,
      inputYear,
      inputFaculty,
      button,
      form,
    };
  }

  function updateTable(tableRows) {
    let HTMLCollection = '';
    const thisYear = new Date().getFullYear();
    tableRows.forEach((row) => {
      let course = 1;
      if (thisYear - row.year > 0) course = thisYear - row.year;
      const isCoursEducation = course > 4 ? 'Закончил' : `${course} курс`;
      const HTMLRowTable = `
      <tr>
        <td>${row.fullName}</td>
        <td>${row.date} (${new Date().getFullYear() - Number(row.date.split('-').shift())} лет)</td>
        <td>${row.year} - ${+row.year + 4} (${isCoursEducation})</td>
        <td>${row.faculty}</td>
      </tr>
      `;
      HTMLCollection += HTMLRowTable;
    });
    tbody.innerHTML = HTMLCollection;
    return tbody.innerHTML;
  }

  function getLocalStorage() {
    const tableRows = [];

    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i).includes('-student')) {
        const key = localStorage.getItem(localStorage.key(i));
        const keyValue = JSON.parse(key);
        if (!Array.isArray(keyValue) && Object.keys(keyValue).length !== 0) {
          const row = {
            fullName: keyValue.fullName,
            date: keyValue.date,
            year: keyValue.year,
            faculty: keyValue.faculty,
          };
          tableRows.push(row);
        }
      }
    }

    return tableRows;
  }

  function createSearchSection() {
    const classInput = 'form-control';

    const container = createElement('div', ['container', 'mb-2']);
    const form = createElement('form', ['input-group', 'mb-3']);
    const button = createElement('button', ['btn', 'btn-outline-secondary']);

    function createFormSearch(idSearch, placeholderSearch) {
      const input = createElement('input', [classInput]);

      input.id = idSearch;
      input.placeholder = placeholderSearch;

      form.append(input);

      return input;
    }

    const fullNameSearch = createFormSearch('name', 'по имени...');
    const facultySearch = createFormSearch('faculty', 'по факультету...');
    const yearStartSearch = createFormSearch('year-start', 'по году начала...');
    const yearEndSearch = createFormSearch('year-end', 'по году окончания...');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const storage = getLocalStorage();
      updateTable(storage
        .filter((tableRow) => tableRow.fullName.toLowerCase()
          .includes(fullNameSearch.value.toLowerCase()))
        .filter((tabelRow) => {
          if (facultySearch.value.trim()) {
            return tabelRow.faculty.includes(facultySearch.value.trim());
          }
          return true;
        })
        .filter((tableRow) => {
          if (yearStartSearch.value.trim()) return (tableRow.year === yearStartSearch.value.trim());
          return true;
        }).filter((tableRow) => {
          if (yearEndSearch.value.trim()) {
            return (Number(tableRow.year) + 4 === Number(yearEndSearch.value.trim()));
          }
          return true;
        }));
    });
    button.innerText = 'Поиск';
    form.append(fullNameSearch, facultySearch, yearStartSearch, yearEndSearch, button);
    container.append(form);

    return {
      container,
      fullNameSearch,
      facultySearch,
      yearStartSearch,
      yearEndSearch,
    };
  }

  function setLocalStorage(objectData) {
    const id = `${Date.now()}-student`;
    window.localStorage.setItem(id, JSON.stringify(objectData));
    return getLocalStorage();
  }

  function columnsSort(element) {
    const storage = getLocalStorage();
    updateTable(storage.sort((a, b) => {
      if (a[element.getAttribute('data-sort')] > b[element.getAttribute('data-sort')]) return 1;
      if (a[element.getAttribute('data-sort')] < b[element.getAttribute('data-sort')]) return -1;
      return 0;
    }));
  }

  // создаем заголовок таблицы
  function createHeaderTable() {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    const arrayHeaders = ['ФИО', 'Дата рождения', 'Годы обучения', 'Факультет'];
    const arraySortTitles = ['fullName', 'date', 'year', 'faculty'];

    // for (const arrayHeader in arrayHeaders) {
    //   const th = createElement('th', ['col']);
    //   th.textContent = arrayHeaders[arrayHeader];
    //   th.setAttribute('data-sort', `${arraySortTitles[arrayHeader]}`);
    //   th.addEventListener('click', (e) => columnsSort(e.target));
    //   tr.append(th);
    // } // Линтер ругается тут очень сильно :(

    for (let i = 0; i < arrayHeaders.length; i++) {
      const th = createElement('th', ['col']);
      th.textContent = arrayHeaders[i];
      th.setAttribute('data-sort', `${arraySortTitles[i]}`);
      th.addEventListener('click', (e) => columnsSort(e.target));
      tr.append(th);
    }

    thead.append(tr);
    return thead;
  }

  function createErrorValidate(erorrMsg) {
    const spanErorr = document.createElement('span');
    spanErorr.textContent = erorrMsg;
    return spanErorr;
  }

  function validateDataForm(formData) {
    let result = [];
    const maxDate = new Date().toJSON().split('T').shift(); // 2022-08-20
    if (!formData.fullName.trim().length > 0) {
      result.push(createErrorValidate('Поле ФИО не заполнено!'));
    }
    if (!formData.date.trim().length > 0) {
      result.push(createErrorValidate('Поле дата рождения не заполнено!'));
    } else {
      const minDate = new Date('1900-01-01').toJSON().split('T').shift();

      const innerDate = new Date(formData.date).toJSON().split('T').shift();

      if (!(innerDate >= minDate && innerDate <= maxDate)) result.push(createErrorValidate(`Дата рождения меньше ${minDate} или больше ${maxDate}`));
    }
    if (!formData.year.trim().length > 0) {
      result.push(createErrorValidate('Поле год начала обучения не заполнено!'));
    } else if (!(Number(formData.year.trim()) <= Number(maxDate.split('-').shift()))) {
      result.push(createErrorValidate('Год начала обучения больше текущего года'));
    }
    if (!formData.faculty.trim().length > 0) {
      result.push(createErrorValidate('Поле факультет не заполнено!'));
    }

    if (!result.length) {
      result = {
        fullName: formData.fullName,
        date: formData.date,
        year: formData.year,
        faculty: formData.faculty,
      };
    }
    return result;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const container = createForm();
    const search = createSearchSection();
    const table = createElement('table', ['table', 'container']);
    table.append(createHeaderTable(), tbody);

    container.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isErorrLabel = container.form.querySelector('div[data-error]');
      if (isErorrLabel !== null) isErorrLabel.remove();

      const objectData = {
        fullName: container.inputFullName.value.split(' ').filter((str) => str.length > 0).join(' '),
        date: container.inputDate.value,
        year: container.inputYear.value,
        faculty: container.inputFaculty.value.trim(),
      };

      const validate = validateDataForm(objectData);
      if (Array.isArray(validate)) {
        const errorLabel = createElement('div', ['alert', 'alert-danger', 'd-flex', 'flex-column']);
        errorLabel.setAttribute('data-error', true);

        validate.forEach((elementError) => errorLabel.append(elementError));
        container.form.append(errorLabel);
      } else {
        updateTable(setLocalStorage(validate));
        container.inputYear.value = '';
        container.inputFaculty.value = '';
        container.inputFullName.value = '';
        container.inputDate.value = '';
      }
    });
    document.getElementById('app').append(container.form, search.container, table);
    updateTable(getLocalStorage());
  });
})();

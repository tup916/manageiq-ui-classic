import React from 'react';
import { componentMapper } from '@data-driven-forms/pf3-component-mapper';
import { componentTypes } from '@@ddf';

import AsyncCredentials from '../../components/async-credentials/async-credentials';
import DualGroup from '../../components/dual-group';
import DualListSelect from '../../components/dual-list-select';
import EditPasswordField from '../../components/async-credentials/edit-password-field';
import PasswordField from '../../components/async-credentials/password-field';
import Select from '../../components/select';
import { DataDrivenFormCodeEditor } from '../../components/code-editor';
import FieldArray from '../../components/field-array';
import TreeViewField from '../../components/tree-view/field';

const mapper = {
  ...componentMapper,
  'code-editor': DataDrivenFormCodeEditor,
  'edit-password-field': EditPasswordField,
  'field-array': FieldArray,
  'dual-group': DualGroup,
  'dual-list-select': DualListSelect,
  'password-field': PasswordField,
  'validate-credentials': AsyncCredentials,
  'tree-view': TreeViewField,
  [componentTypes.SELECT]: Select,
};

export default mapper;

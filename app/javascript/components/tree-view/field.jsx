import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Tree, { ActionTypes } from '@manageiq/react-ui-components/dist/wooden-tree';
import {
  ControlLabel, FieldLevelHelp, FormGroup, HelpBlock,
} from 'patternfly-react';

import RequiredLabel from '../../forms/required-label';
import { convert, flatten } from './helpers';
import { useFieldApi, useFormApi } from '@@ddf';

const setChecked = (keys = []) => ({ state, ...node }) => ({ ...node, state: { ...state, checked: keys.includes(node.attr.key) } });

const TreeViewField = ({ loadData, lazyLoadData, ...props }) => {
  const [{ nodes }, setState] = useState({});

  const { input: { value }, meta } = useFieldApi(props);
  const formOptions = useFormApi();

  useEffect(() => {
    loadData().then((values) => {
      setState(state => ({ ...state, nodes: flatten(convert(values, setChecked(value))) }));
    });
  }, [loadData]);

  const actionMapper = {
    [ActionTypes.EXPANDED]: Tree.nodeExpanded,
    [ActionTypes.CHECKED]: Tree.nodeChecked,
    [ActionTypes.DISABLED]: Tree.nodeDisabled,
    [ActionTypes.SELECTED]: Tree.nodeSelected,
    [ActionTypes.LOADING]: Tree.nodeLoading,
    [ActionTypes.CHILD_NODES]: (node, value) => {
      // There's a bug in the react-wooden-tree, the passed value here contains all the child
      // nodes and that would force the tree to mount nested children to the parent node twice.
      // For now we're filtering out the child nodes manually by counting the number of dots in
      // their identifier.
      const min = value.reduce((min, key) => {
        const nl = key.split('.').length;
        return nl > min ? min : nl;
      }, undefined);

      return Tree.nodeChildren(node, value.filter(key => key.split('.').length === min));
    },
    [ActionTypes.CHECKED_DIRECTLY]: (node, value) => {
      const values = formOptions.getFieldState(props.name).value;
      formOptions.change(props.name, value ? [...values, node.attr.key] : values.filter(item => item !== node.attr.key));

      return Tree.nodeChecked(node, value);
    },
  };

  const lazyLoad = node => lazyLoadData(node).then((result) => {
    const data = flatten(convert(result, setChecked(value)));

    let subtree = {};
    Object.keys(data).forEach((key) => {
      if (key !== '') {
        // Creating the node id from the parent id.
        const nodeId = `${node.nodeId}.${key}`;
        // Updating the children ids, so it does not point to something else.
        const element = { ...data[key], nodeId, nodes: data[key].nodes.map(child => `${node.nodeId}.${child}`) };
        subtree = { ...subtree, [nodeId]: element };
      }
    });
    return subtree;
  });

  const onDataChange = commands => setState(state => ({
    ...state,
    nodes: commands.reduce(
      (nodes, { type, value, nodeId }) => (
        type === ActionTypes.ADD_NODES
          ? Tree.addNodes(nodes, value)
          : Tree.nodeUpdater(nodes, actionMapper[type](Tree.nodeSelector(nodes, nodeId), value))
      ), nodes,
    ),
  }));

  return (
    <FormGroup validationState={meta.error ? 'error' : null}>
      <ControlLabel>
        {props.isRequired ? <RequiredLabel label={props.label} /> : props.label }
        {props.helperText && <FieldLevelHelp content={props.helperText} />}
      </ControlLabel>
      <Tree
        data={nodes}
        nodeIcon=""
        expandIcon="fa fa-fw fa-angle-right"
        collapseIcon="fa fa-fw fa-angle-down"
        loadingIcon="fa fa-fw fa-spinner fa-pulse"
        checkedIcon="fa fa-fw fa-check-square-o"
        uncheckedIcon="fa fa-fw fa-square-o"
        selectedIcon=""
        partiallyCheckedIcon="fa fa-fw fa-check-square"
        preventDeselect
        showCheckbox
        callbacks={{ onDataChange, lazyLoad }}
        {...props}
      />
      {meta.error && <HelpBlock>{ meta.error }</HelpBlock>}
    </FormGroup>
  );
};

TreeViewField.propTypes = {
  loadData: PropTypes.func,
  lazyLoadData: PropTypes.func,
};

export default TreeViewField;

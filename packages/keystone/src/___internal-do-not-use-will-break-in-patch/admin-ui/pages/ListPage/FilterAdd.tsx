/** @jsxRuntime classic */
/** @jsx jsx */

import { ComponentProps, Fragment, FormEvent, useMemo, useState } from 'react';
import { Button } from '@keystone-ui/button';
import { Box, Divider, Heading, Stack, VisuallyHidden, jsx, useTheme } from '@keystone-ui/core';
import { Select } from '@keystone-ui/fields';
import { ChevronLeftIcon } from '@keystone-ui/icons/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '@keystone-ui/icons/icons/ChevronRightIcon';
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon';
import { OptionPrimitive, Options } from '@keystone-ui/options';
import { PopoverDialog, usePopover } from '@keystone-ui/popover';
import { useTranslation } from 'react-i18next';

import { FieldMeta, JSONValue } from '../../../../types';
import { useList } from '../../../../admin-ui/context';
import { useRouter } from '../../../../admin-ui/router';

type State =
  | { kind: 'selecting-field' }
  | { kind: 'filter-value'; fieldPath: string; filterType: string; filterValue: JSONValue };

const fieldSelectComponents: ComponentProps<typeof Options>['components'] = {
  Option: ({ children, ...props }) => {
    let theme = useTheme();
    let iconColor = props.isFocused ? theme.colors.foreground : theme.colors.foregroundDim;
    return (
      <OptionPrimitive {...props}>
        <span>{children}</span>
        <div
          css={{
            alignItems: 'center',
            display: 'flex',
            height: 24,
            justifyContent: 'center',
            width: 24,
          }}
        >
          <ChevronRightIcon css={{ color: iconColor }} />
        </div>
      </OptionPrimitive>
    );
  },
};
export function FilterAdd({
  listKey,
  filterableFields,
}: {
  listKey: string;
  filterableFields: Set<string>;
}) {
  const { isOpen, setOpen, trigger, dialog, arrow } = usePopover({
    placement: 'bottom',
    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
  });
  const { t } = useTranslation();

  return (
    <Fragment>
      <Button
        tone="active"
        size="small"
        {...trigger.props}
        ref={trigger.ref}
        onClick={() => setOpen(true)}
      >
        <Box as="span" marginRight="xsmall">
          {t('Filter List')}
        </Box>
        <ChevronDownIcon size="small" />
      </Button>
      <PopoverDialog
        aria-label={`Filters options, list of filters to apply to the ${listKey} list`}
        arrow={arrow}
        isVisible={isOpen}
        {...dialog.props}
        ref={dialog.ref}
      >
        {isOpen && (
          <FilterAddPopoverContent
            onClose={() => {
              setOpen(false);
            }}
            listKey={listKey}
            filterableFields={filterableFields}
          />
        )}
      </PopoverDialog>
    </Fragment>
  );
}

function FilterAddPopoverContent({
  onClose,
  listKey,
  filterableFields,
}: {
  onClose: () => void;
  listKey: string;
  filterableFields: Set<string>;
}) {
  const list = useList(listKey);
  const router = useRouter();
  const { t } = useTranslation();
  const fieldsWithFilters = useMemo(() => {
    const fieldsWithFilters: Record<
      string,
      FieldMeta & { controller: { filter: NonNullable<FieldMeta['controller']['filter']> } }
    > = {};
    Object.keys(list.fields).forEach(fieldPath => {
      const field = list.fields[fieldPath];
      if (filterableFields.has(fieldPath) && field.controller.filter) {
        fieldsWithFilters[fieldPath] = field as any;
      }
    });
    return fieldsWithFilters;
  }, [list.fields, filterableFields]);
  const filtersByFieldThenType = useMemo(() => {
    const filtersByFieldThenType: Record<string, Record<string, string>> = {};
    Object.keys(fieldsWithFilters).forEach(fieldPath => {
      const field = fieldsWithFilters[fieldPath];
      let hasUnusedFilters = false;
      const filters: Record<string, string> = {};
      Object.keys(field.controller.filter.types).forEach(filterType => {
        if (router.query[`!${fieldPath}_${filterType}`] === undefined) {
          hasUnusedFilters = true;
          filters[filterType] = field.controller.filter.types[filterType].label;
        }
      });
      if (hasUnusedFilters) {
        filtersByFieldThenType[fieldPath] = filters;
      }
    });
    return filtersByFieldThenType;
  }, [router.query, fieldsWithFilters]);
  const [state, setState] = useState<State>({ kind: 'selecting-field' });

  return (
    <Stack
      padding="medium"
      as="form"
      css={{ minWidth: 320 }}
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        if (state.kind === 'filter-value') {
          router.push({
            query: {
              ...router.query,
              [`!${state.fieldPath}_${state.filterType}`]: JSON.stringify(state.filterValue),
            },
          });
          onClose();
        }
      }}
      gap="small"
    >
      <div css={{ position: 'relative' }}>
        {state.kind !== 'selecting-field' && (
          <button
            type="button"
            onClick={() => {
              setState({ kind: 'selecting-field' });
            }}
            css={{
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              position: 'absolute',
            }}
          >
            <VisuallyHidden>{t('Back')}</VisuallyHidden>
            <ChevronLeftIcon size="smallish" />
          </button>
        )}
        <Heading textAlign="center" type="h5">
          {(() => {
            switch (state.kind) {
              case 'selecting-field': {
                return t('Filter');
              }
              case 'filter-value': {
                return t(`${list.key}.${list.fields[state.fieldPath].label}`);
              }
            }
          })()}
        </Heading>
      </div>
      <Divider />
      {state.kind === 'selecting-field' && (
        <Options
          components={fieldSelectComponents}
          onChange={newVal => {
            const fieldPath: string = (newVal as any).value;
            const filterType = Object.keys(filtersByFieldThenType[fieldPath])[0];
            setState({
              kind: 'filter-value',
              fieldPath,
              filterType,
              filterValue:
                fieldsWithFilters[fieldPath].controller.filter.types[filterType].initialValue,
            });
          }}
          options={Object.keys(filtersByFieldThenType).map(fieldPath => ({
            label: t(`${list.key}.${fieldsWithFilters[fieldPath].label}`) || fieldsWithFilters[fieldPath].label,
            value: fieldPath,
          }))}
          placeholder={t('Select...')}
        />
      )}
      {state.kind === 'filter-value' && (
        <Select
          width="full"
          value={{
            value: state.filterType,
            label: t(filtersByFieldThenType[state.fieldPath][state.filterType]),
          }}
          onChange={newVal => {
            if (newVal) {
              setState({
                kind: 'filter-value',
                fieldPath: state.fieldPath,
                filterValue:
                  fieldsWithFilters[state.fieldPath].controller.filter.types[newVal.value]
                    .initialValue,
                filterType: newVal.value,
              });
            }
          }}
          options={Object.keys(filtersByFieldThenType[state.fieldPath]).map(filterType => ({
            label: t(filtersByFieldThenType[state.fieldPath][filterType]) || filtersByFieldThenType[state.fieldPath][filterType],
            value: filterType,
          }))}
          placeholder={t('Select...')}
        />
      )}
      {state.kind == 'filter-value' &&
        (() => {
          const { Filter } = fieldsWithFilters[state.fieldPath].controller.filter;
          return (
            <Filter
              type={state.filterType}
              value={state.filterValue}
              onChange={value => {
                setState(state => ({
                  ...state,
                  filterValue: value,
                }));
              }}
            />
          );
        })()}
      {state.kind == 'filter-value' && (
        <div css={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose}>{t('Cancel')}</Button>
          <Button type="submit">{t('Apply')}</Button>
        </div>
      )}
    </Stack>
  );
}

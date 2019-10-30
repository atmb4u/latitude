/**
 * TEAM: frontend_infra
 *
 * @flow strict-local
 */
import * as React from "react";
import {FixedSizeList} from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import {StyleSheet, css} from "aphrodite";
import AutoSizer from "react-virtualized-auto-sizer";

import PopupWithClickAway from "../popup/PopupWithClickAway";
import IconButton from "../button/IconButton";
import Tooltip from "../Tooltip";
import Checkbox from "../Checkbox";
import CheckboxList from "../CheckboxList";
import invariant from "../tools/invariant";
import Text from "../Text";
import Icon from "../Icon";
import Loader from "../Loader";
import colors from "../styles/colors";
import Clickable from "../base_candidate/Clickable";
import RowContext from "./RowContext";
import latitudeColors from "../colors";

export type Style = { [string]: string | number };

export type ColumnDefinition<T> = {|
  +id: string,
  +header: string,
  +render: T => React.Node,
  +renderAggregate?: ($ReadOnlyArray<T>) => React.Node,
  +width: number,
  +comparator?: (T, T) => number,
  +aggregateComparator?: ($ReadOnlyArray<T>, $ReadOnlyArray<T>) => number,
  +headerAlignment?: "left" | "center" | "right",
  +tooltipText?: string,
|};

type Sort = {|
  +columnId: string,
  +direction: "asc" | "desc",
|};

type Pin = {|
  +columnId: string,
  +align: "left" | "right",
|};

type Hide = {|
  +columnId: string,
|};

type Column<T> = {
  id: string,
  Header: () => React.Node,
  Cell: React.ComponentType<{|
    +row: T,
  |}>,
  AggregateCell: React.ComponentType<{|
    +rows: $ReadOnlyArray<T>,
  |}>,
  pinned: "left" | "right" | null,
  width: number,
};

type FlattenedRow<T> =
  | {
  id: string,
  isAggregate: true,
  rows: $ReadOnlyArray<T>,
}
  | {
  id: string,
  isAggregate: false,
  row: T,
};

export const HEADER_HEIGHT = 32;
export const DEFAULT_ROW_HEIGHT = 44;
export const COLUMN_PADDING = 20;
export const FIRST_COLUMN_PADDING = 12;
export const PINNED_COLUMN_BORDER_WIDTH = 2;
export const ROW_EXPANSION_COLUMN_WIDTH = 48;
export const ROW_SELECTION_COLUMN_WIDTH = 48;

const noop = () => {
};

function handleCellClick(e: SyntheticEvent<HTMLDivElement>) {
  e.stopPropagation();
}

/**
 * @short Displays tabular data
 * @brandStatus V2
 * @status Beta
 * @category Data Display
 *
 * **DISCLAIMER: The table component is still under active development**
 *
 * `<Table />` efficiently displays large amounts of data, and supports column pinning,
 * row selection, sorting, and scrolling. Expandable rows, cell selection, drag-and-drop
 * column reordering, and other features are coming soon.
 */
export default function NewTable<T>({
  data,
  columnDefinitions,
  getUniqueRowId,
  rowSelectionEnabled = false,
  rowSelectionPinned = true,
  onSelectedRowsChange = noop,
  selectedRows = new Set(),
  rowHeight = DEFAULT_ROW_HEIGHT,
  pinnedColumns = [],
  columnCustomizationEnabled = false,
  hiddenColumns = [],
  onHiddenColumnsChange = noop,
  sortBy,
  onSortByChange = noop,
  rowAggregationEnabled = false,
  rowAggregationPinned = true,
  getRowGroupId,
  expandedRows = new Set(),
  onExpandedRowsChange = noop,
  hasNextPage = false,
  isNextPageLoading = false,
  loadNextPage = noop,
  rowClickingEnabled = false,
  clickedRow,
  onRowClick = noop,
  rowGroupClickingEnabled = false,
  clickedRowGroup,
  onRowGroupClick = noop,
  isLoading = false,
}: {
  /** An array of data for each row in the table */
  +data: $ReadOnlyArray<T>,
  /** Defines how each column of data is rendered. Each column definitions needs an id, a header, a Cell, a width, and a comparator for sorting */
  +columnDefinitions: $ReadOnlyArray<ColumnDefinition<T>>,
  /** A function to uniquely identify each row, this ID is what is returned in the row selections set */
  +getUniqueRowId: T => string,
  /** Whether or not checkboxes for row selection will be shown */
  +rowSelectionEnabled?: boolean,
  /** Whether or not the checkboxes for row selection will be pinned to the left of the table */
  +rowSelectionPinned?: boolean,
  /** Callback for when the user changes the selected rows */
  +onSelectedRowsChange?: ($ReadOnlySet<string>) => void,
  /** Which rows are selected, based on IDs returned from getUniqueRowId */
  +selectedRows?: $ReadOnlySet<string>,
  /** Controls the height of each row in the table */
  +rowHeight?: number,
  /** Which columns are pinned to either the left or right side of the table (other columns will scroll underneath) */
  +pinnedColumns?: $ReadOnlyArray<Pin>,
  /** Callback for when the user changes pinned columns */
  +onPinnedColumnsChange?: ($ReadOnlyArray<Pin>) => void,
  /** Whether or not to show the + for changing column visibility */
  +columnCustomizationEnabled?: boolean,
  /** Which columns are hidden */
  +hiddenColumns?: $ReadOnlyArray<Hide>,
  /** Callback for when the user changes which columns are hidden */
  +onHiddenColumnsChange?: ($ReadOnlyArray<Hide>) => void,
  /** Which column to sort by, and what direction to sort */
  +sortBy?: ?Sort,
  /** Callback for when the user changes which column and direction to sort */
  +onSortByChange?: (?Sort) => void,
  /** Whether or not rows will be grouped and an aggregation row is present */
  +rowAggregationEnabled?: boolean,
  /** Whether or not the arrows for row aggregation will be pinned to the left of the table */
  +rowAggregationPinned?: boolean,
  /** A function to determine which row group the row belongs to, this ID is what is returned in the row expansions set  */
  +getRowGroupId?: T => string,
  /** Which row groups are expanded, based on IDs returned from getRowGroupId */
  +expandedRows?: $ReadOnlySet<string>,
  /** Callback for when the user expands a row group */
  +onExpandedRowsChange?: ($ReadOnlySet<string>) => void,
  /** Whether additional data can be loaded from the server. Used for scrolling pagination */
  +hasNextPage?: boolean,
  /** Whether additional data is currently being loaded. Used for scrolling pagination */
  +isNextPageLoading?: boolean,
  /** Callback to load additional data when a user nears the end of the existing list of data. Used for scrolling pagination */
  +loadNextPage?: () => mixed,
  +rowClickingEnabled?: boolean,
  +clickedRow?: ?string,
  +onRowClick?: string => void,
  +rowGroupClickingEnabled?: boolean,
  +clickedRowGroup?: ?string,
  +onRowGroupClick?: string => void,
  /** Initial results are loading */
  +isLoading?: boolean,
}) {
  const visibleColumnDefinitions = columnDefinitions // .filter(
  //   cd => !hiddenColumns.find(c => c.columnId === cd.id)
  // );

  // function sortRows(rows: $ReadOnlyArray<T>, sortBy: ?Sort) {
  //   if (!sortBy) {
  //     return rows;
  //   }
  //   const columnDefinition = columnDefinitions.find(
  //     cd => cd.id === sortBy.columnId
  //   );
  //   invariant(
  //     columnDefinition != null,
  //     `column definition with id ${sortBy.columnId} does not exist`
  //   );
  //   const {comparator} = columnDefinition;
  //   invariant(
  //     comparator != null,
  //     `comparator does not exist for column definition with id ${
  //       sortBy.columnId
  //     }`
  //   );
  //   const multiplier = sortBy.direction === "asc" ? 1 : -1;
  //   return [...rows].sort((a, b) => multiplier * comparator(a, b));
  // }

  const sortedRows = data // sortRows(data, sortBy);

  // function groupRows(
  //   rows: $ReadOnlyArray<T>
  // ): $ReadOnlyArray<$ReadOnlyArray<T>> {
  //   invariant(
  //     getRowGroupId,
  //     "getRowGroupId must be provided to aggregate rows"
  //   );
  //   const rowGroupIdToRows = new Map<string, $ReadOnlyArray<T>>();
  //   rows.forEach(row => {
  //     const rowGroupId = getRowGroupId(row);
  //     const rows = rowGroupIdToRows.get(rowGroupId);
  //     rowGroupIdToRows.set(rowGroupId, rows ? [...rows, row] : [row]);
  //   });
  //   return [...rowGroupIdToRows.values()];
  // }
  //
  // function sortRowGroups(rowGroups: $ReadOnlyArray<$ReadOnlyArray<T>>) {
  //   if (!sortBy) {
  //     return rowGroups;
  //   }
  //   const columnDefinition = columnDefinitions.find(
  //     cd => cd.id === sortBy.columnId
  //   );
  //   invariant(
  //     columnDefinition != null,
  //     `column definition with id ${sortBy.columnId} does not exist`
  //   );
  //   const {comparator, aggregateComparator} = columnDefinition;
  //
  //   const multiplier = sortBy.direction === "asc" ? 1 : -1;
  //   return [...rowGroups].sort((as, bs) => {
  //     if (aggregateComparator) {
  //       return multiplier * aggregateComparator(as, bs);
  //     }
  //     invariant(
  //       comparator != null,
  //       `comparator must exist if aggregateComparator does not exist for column definition with id ${
  //         sortBy.columnId
  //       }`
  //     );
  //     return multiplier * comparator(as[0], bs[0]);
  //   });
  // }
  //
  // function flattenRows(
  //   rows: $ReadOnlyArray<T>
  // ): $ReadOnlyArray<FlattenedRow<T>> {
  //   return rows.map(row => ({
  //     id: getUniqueRowId(row),
  //     isAggregate: false,
  //     row,
  //   }));
  // }
  //
  // function flattenRowGroups(
  //   rowGroups: $ReadOnlyArray<$ReadOnlyArray<T>>
  // ): $ReadOnlyArray<FlattenedRow<T>> {
  //   invariant(getRowGroupId);
  //   return rowGroups.reduce(
  //     (rows, rowGroup) => [
  //       ...rows,
  //       {
  //         id: getRowGroupId(rowGroup[0]),
  //         isAggregate: true,
  //         rows: rowGroup,
  //       },
  //       ...(expandedRows.has(getRowGroupId(rowGroup[0]))
  //         ? flattenRows(rowGroup)
  //         : []),
  //     ],
  //     []
  //   );
  // }

  const flattenedRows = sortedRows // rowAggregationEnabled
  // ? flattenRowGroups(sortRowGroups(groupRows(sortedRows)))
  // : flattenRows(sortedRows);

  // const rowSelectionColumn = {
  //   id: "row_selection",
  //   pinned:
  //     rowSelectionPinned ||
  //     pinnedColumns.find(({align}) => align === "left") != null
  //       ? "left"
  //       : null,
  //   Header: () => (
  //     <div className={css(styles.rowSelectionCell)}>
  //       <Checkbox
  //         checked={selectedRows.size === data.length}
  //         onChange={isSelected => {
  //           if (isSelected) {
  //             onSelectedRowsChange(new Set(data.map(getUniqueRowId)));
  //           } else {
  //             onSelectedRowsChange(new Set());
  //           }
  //         }}
  //       />
  //     </div>
  //   ),
  //   Cell: ({row}) => (
  //     <div
  //       className={css(styles.rowSelectionCell)}
  //       onClick={handleCellClick}
  //       role="presentation"
  //     >
  //       <Checkbox
  //         checked={selectedRows.has(getUniqueRowId(row))}
  //         onChange={isSelected => {
  //           const newSelection = new Set(selectedRows);
  //           if (isSelected) {
  //             newSelection.add(getUniqueRowId(row));
  //           } else {
  //             newSelection.delete(getUniqueRowId(row));
  //           }
  //           onSelectedRowsChange(newSelection);
  //         }}
  //       />
  //     </div>
  //   ),
  //   AggregateCell: ({rows}) => (
  //     <div
  //       className={css(styles.rowSelectionCell)}
  //       onClick={handleCellClick}
  //       role="presentation"
  //     >
  //       <Checkbox
  //         checked={rows.every(row => selectedRows.has(getUniqueRowId(row)))}
  //         onChange={isSelected => {
  //           const newSelection = new Set(selectedRows);
  //           if (isSelected) {
  //             rows.forEach(row => newSelection.add(getUniqueRowId(row)));
  //           } else {
  //             rows.forEach(row => newSelection.delete(getUniqueRowId(row)));
  //           }
  //           onSelectedRowsChange(newSelection);
  //         }}
  //       />
  //     </div>
  //   ),
  //   width: 52,
  // };

  // const rowExpansionColumn = {
  //   id: "row_expansion",
  //   pinned:
  //     rowAggregationPinned ||
  //     pinnedColumns.find(({align}) => align === "left") != null
  //       ? "left"
  //       : null,
  //   Header: () => <div className={css(styles.rowExpansionCell)} />,
  //   Cell: () => <div className={css(styles.rowExpansionCell)} />,
  //   AggregateCell: ({rows}) => {
  //     invariant(getRowGroupId);
  //     return (
  //       <div
  //         className={css(styles.rowExpansionCell)}
  //         onClick={handleCellClick}
  //         role="presentation"
  //       >
  //         <IconButton
  //           size="s"
  //           kind="blank"
  //           type="button"
  //           iconName={
  //             expandedRows.has(getRowGroupId(rows[0]))
  //               ? "downOpen"
  //               : "rightOpen"
  //           }
  //           onClick={() => {
  //             const rowGroupId = getRowGroupId(rows[0]);
  //             const newExpandedRows = new Set(expandedRows);
  //             if (expandedRows.has(rowGroupId)) {
  //               newExpandedRows.delete(rowGroupId);
  //             } else {
  //               newExpandedRows.add(rowGroupId);
  //             }
  //             onExpandedRowsChange(newExpandedRows);
  //           }}
  //         />
  //       </div>
  //     );
  //   },
  //   width: 52,
  // };

  const columns = [
    // ...(rowAggregationEnabled ? [rowExpansionColumn] : []),
    // ...(rowSelectionEnabled ? [rowSelectionColumn] : []),
    ...visibleColumnDefinitions.map(
      ({
        id,
        header,
        render,
        renderAggregate,
        width,
        headerAlignment,
        comparator,
        aggregateComparator,
        tooltipText,
      }) => {
        const pin = pinnedColumns.find(({columnId}) => columnId === id);
        return {
          id,
          Header: () =>
            // aggregateComparator || comparator ? (
            //   <SortableHeader
            //     key={id}
            //     style={{
            //       width: width + 2 * COLUMN_PADDING,
            //     }}
            //     onSortDirectionChange={direction =>
            //       onSortByChange(direction ? {columnId: id, direction} : null)
            //     }
            //     sortDirection={
            //       sortBy && sortBy.columnId === id ? sortBy.direction : null
            //     }
            //     header={header}
            //     align={headerAlignment || "left"}
            //     tooltipText={tooltipText}
            //   />
            // ) : (
            <Header
              key={id}
              style={{
                width: width + 2 * COLUMN_PADDING,
              }}
              header={header}
              align={headerAlignment || "left"}
              tooltipText={tooltipText}
            />
          ,
          Cell: ({row}) => (
            <div
              key={id}
              className={css(styles.cell)}
              style={{
                width: width + 2 * COLUMN_PADDING,
              }}
            >
              {render(row)}
            </div>
          ),
          AggregateCell: ({rows}) => (
            <div
              key={id}
              className={css(styles.cell)}
              style={{
                width: width + 2 * COLUMN_PADDING,
              }}
            >
              {renderAggregate ? renderAggregate(rows) : render(rows[0])}
            </div>
          ),
          pinned: pin ? pin.align : null,
          width: width + 2 * COLUMN_PADDING,
        };
      }
    ),
  ];

  const rowWidth = columns.reduce(
    (sum, cell) => sum + cell.width,
    FIRST_COLUMN_PADDING +
    (columns.find(({pinned}) => pinned === "left")
      ? FIRST_COLUMN_PADDING + PINNED_COLUMN_BORDER_WIDTH
      : 0) +
    (columns.find(({pinned}) => pinned === "right")
      ? FIRST_COLUMN_PADDING + PINNED_COLUMN_BORDER_WIDTH
      : 0)
  );

  // const innerElementType = React.forwardRef(({children, ...rest}, ref) => (
  //   <div ref={ref} {...rest}>
  //     <HeaderRow
  //       columns={columns}
  //       style={{
  //         minWidth: rowWidth,
  //       }}
  //     />
  //     {children}
  //   </div>
  // ));

  // function isRowSelected(flattenedRow: ?FlattenedRow<T>) {
  //   if (!flattenedRow) {
  //     return false;
  //   }
  //   if (flattenedRow.isAggregate) {
  //     return flattenedRow.rows.every(row =>
  //       selectedRows.has(getUniqueRowId(row))
  //     );
  //   }
  //   return selectedRows.has(getUniqueRowId(flattenedRow.row));
  // }

  // function isRowClicked(flattenedRow: ?FlattenedRow<T>) {
  //   if (!flattenedRow) {
  //     return false;
  //   }
  //   if (flattenedRow.isAggregate) {
  //     return clickedRowGroup === flattenedRow.id;
  //   }
  //   return clickedRow === flattenedRow.id;
  // }

  /* Scrolling Pagination */
  // If more results are available to fetch, or we are still loading initial results,
  // add an extra row to hold a loading indicator
  // const rowCount =
  //   isLoading || hasNextPage ? flattenedRows.length + 1 : flattenedRows.length;
  // If we are already fetching more rows, do not try to re-fetch
  // const loadMoreItems = isNextPageLoading ? () => {
  // } : loadNextPage;

  // Every row is considered loaded except for the loading indicator
  // const isItemLoaded = (index: number) =>
  //   !hasNextPage || index < flattenedRows.length;

  const width = columnDefinitions.reduce((sum, cell) => sum + cell.width, 0) + columnDefinitions.length*40
  return (
    <div style={{overflow: "scroll", maxHeight: "100%"}}>
      <div style={{width}}>
        <HeaderRow columns={columnDefinitions} />
        <table style={{width: "100%", tableLayout: "fixed"}}>
          <HeaderRow columns={columnDefinitions} />
          <tbody>
          {data.map(item => <Row key={getUniqueRowId(item)} columns={columnDefinitions} data={item}/>)}
          </tbody>
        </table>
      </div>
    </div>
  );

  // const ItemRenderer = ({index, style}: {| +index: number, +style: Style |}) => {
  //   // const [highlightedRowIndex, setHighlightedRowIndex] = React.useState(null);
  //
  //   if (isLoading) {
  //     return (
  //       <div
  //         className={css(styles.loadingIndicator)}
  //         style={{
  //           ...style,
  //           top: style.top + HEADER_HEIGHT,
  //         }}
  //       >
  //         <Loader loaded={false} />
  //       </div>
  //     );
  //   } else if (!isItemLoaded(index)) {
  //     return (
  //       <div
  //         className={css(styles.row, styles.infiniteLoader)}
  //         style={{
  //           ...style,
  //           top: style.top + HEADER_HEIGHT,
  //         }}
  //       >
  //         <Loader loaded={false} />
  //       </div>
  //     );
  //   }
  //
  //   const flattenedRow = flattenedRows[index];
  //   // const nextFlattenedRow = flattenedRows[index + 1];
  //   // const isSelected = isRowSelected(flattenedRow);
  //   // const isNextSelected = isRowSelected(nextFlattenedRow);
  //   // const isClicked = isRowClicked(flattenedRow);
  //   // const isNextClicked = isRowClicked(nextFlattenedRow);
  //
  //   // const isHighlighted = index === highlightedRowIndex;
  //   return (
  //     <Row
  //       className={css(
  //         styles.row,
  //         // isHighlighted && styles.isHighlighted,
  //         // isSelected && styles.isSelected,
  //         // isNextSelected && styles.isNextSelected,
  //         // (isSelected || isClicked) && styles.isSelected,
  //         // (isNextSelected || isNextClicked) && styles.isNextSelected
  //       )}
  //       style={{
  //         ...style,
  //         top: style.top + HEADER_HEIGHT,
  //         minWidth: rowWidth,
  //       }}
  //       columns={columns}
  //       data={flattenedRow.row}
  //       // onHighlightedChange={isHighlighted =>
  //       //   setHighlightedRowIndex(isHighlighted ? index : null)
  //       // }
  //       // onClick={
  //       //   rowClickingEnabled ? () => onRowClick(flattenedRow.id) : null
  //       // }
  //     />
  //     // <RowContext.Provider value={{isHighlighted, isSelected}}>
  //     //   {flattenedRow.isAggregate ? (
  //     //     <AggregateRow
  //     //       className={css(
  //     //         styles.row,
  //     //         isHighlighted && styles.isHighlighted,
  //     //         (isSelected || isClicked) && styles.isSelected,
  //     //         (isNextSelected || isNextClicked) && styles.isNextSelected
  //     //       )}
  //     //       style={{
  //     //         ...style,
  //     //         top: style.top + HEADER_HEIGHT,
  //     //         minWidth: rowWidth,
  //     //       }}
  //     //       columns={columns}
  //     //       data={flattenedRow.rows}
  //     //       onHighlightedChange={isHighlighted =>
  //     //         setHighlightedRowIndex(isHighlighted ? index : null)
  //     //       }
  //     //       onClick={
  //     //         rowGroupClickingEnabled
  //     //           ? () => onRowGroupClick(flattenedRow.id)
  //     //           : null
  //     //       }
  //     //     />
  //     //   ) : (
  //     //     <Row
  //     //       className={css(
  //     //         styles.row,
  //     //         isHighlighted && styles.isHighlighted,
  //     //         isSelected && styles.isSelected,
  //     //         isNextSelected && styles.isNextSelected,
  //     //         (isSelected || isClicked) && styles.isSelected,
  //     //         (isNextSelected || isNextClicked) && styles.isNextSelected
  //     //       )}
  //     //       style={{
  //     //         ...style,
  //     //         top: style.top + HEADER_HEIGHT,
  //     //         minWidth: rowWidth,
  //     //       }}
  //     //       columns={columns}
  //     //       data={flattenedRow.row}
  //     //       onHighlightedChange={isHighlighted =>
  //     //         setHighlightedRowIndex(isHighlighted ? index : null)
  //     //       }
  //     //       onClick={
  //     //         rowClickingEnabled ? () => onRowClick(flattenedRow.id) : null
  //     //       }
  //     //     />
  //     //   )}
  //     // </RowContext.Provider>
  //   );
  // };

  // const pinnedColumnIds = pinnedColumns.map(({columnId}) => columnId);
  // const customizableColumns = columnDefinitions.filter(
  //   ({id}) => !pinnedColumnIds.includes(id)
  // );

  // return (
  //   <div className={css(styles.table)}>
  //     <AutoSizer>
  //       {({width, height}: {| +width: number, +height: number |}) => (
  //         <InfiniteLoader
  //           isItemLoaded={isItemLoaded}
  //           itemCount={rowCount}
  //           loadMoreItems={loadMoreItems}
  //         >
  //           {({onItemsRendered, ref}) => (
  //             <FixedSizeList
  //               height={height}
  //               itemSize={rowHeight}
  //               itemCount={rowCount}
  //               width={width}
  //               // innerElementType={innerElementType}
  //               onItemsRendered={onItemsRendered}
  //               ref={ref}
  //               // Overscan by roughly one page
  //               overscanCount={Math.ceil(height / rowHeight)}
  //             >
  //               {ItemRenderer}
  //             </FixedSizeList>
  //           )}
  //         </InfiniteLoader>
  //       )}
  //     </AutoSizer>
  //   </div>
  // );
}

// function ColumnCustomization<T>({
//   columnDefinitions,
//   visibleColumnIds,
//   onVisibleColumnIdsChange,
// }: {|
//   +columnDefinitions: $ReadOnlyArray<ColumnDefinition<T>>,
//   +visibleColumnIds: $ReadOnlyArray<string>,
//   +onVisibleColumnIdsChange: ($ReadOnlyArray<string>) => void,
// |}) {
//   return (
//     <div className={css(styles.columnCustomizationContainer)}>
//       <PopupWithClickAway>
//         {(Target, Popup, {openPopup}) => (
//           <>
//             <Target>
//               <IconButton
//                 size="s"
//                 kind="bare"
//                 iconName="add"
//                 type="button"
//                 onClick={openPopup}
//               />
//             </Target>
//             <Popup placement="bottom-end">
//               <div className={css(styles.columnCustomizationPopup)}>
//                 <div>
//                   <CheckboxList
//                     values={visibleColumnIds}
//                     options={columnDefinitions.map(cd => ({
//                       label: cd.header,
//                       value: cd.id,
//                     }))}
//                     onChange={onVisibleColumnIdsChange}
//                     gap={8}
//                     showSelectAllOption={true}
//                   />
//                 </div>
//               </div>
//             </Popup>
//           </>
//         )}
//       </PopupWithClickAway>
//     </div>
//   );
// }

function HeaderRow<T>({
  columns,
  style,
}: {|
  +columns: $ReadOnlyArray<Column<T>>,
  +style?: Style,
|}) {
  // const leftPinnedColumns = columns.filter(({pinned}) => pinned === "left");
  // const unpinnedColumns = columns.filter(({pinned}) => pinned === null);
  // const rightPinnedColumns = columns.filter(({pinned}) => pinned === "right");

  return (
    <thead>
    <tr className={css(styles.headerRow)} style={{paddingLeft: 20}}>
      {columns.map(column => (
        <th style={{width: column.width + 40, paddingLeft: 20}} key={column.id}>
          <Text scale="subtext" color="grey50">
            {column.header}
          </Text>
        </th>
      ))}
    </tr>
    </thead>
  );

  // return (
  //   <div className={css(styles.headerRow)} style={style}>
  //     {leftPinnedColumns.length ? (
  //       <div className={css(styles.leftPinnedDrawer)}>
  //         {leftPinnedColumns.map(({id, Header}) => (
  //           <Header key={id} />
  //         ))}
  //       </div>
  //     ) : null}
  //     <div className={css(styles.unpinnedDrawer)}>
  //       {unpinnedColumns.map(({id, Header}) => (
  //         <Header key={id} />
  //       ))}
  //     </div>
  //     {rightPinnedColumns.length ? (
  //       <div className={css(styles.rightPinnedDrawer)}>
  //         {rightPinnedColumns.map(({id, Header}) => (
  //           <Header key={id} />
  //         ))}
  //       </div>
  //     ) : null}
  //   </div>
  // );
}

// function getIcon(sortDirection: "asc" | "desc" | null) {
//   const iconNames = {
//     asc: "up",
//     desc: "down",
//   };
//
//   return iconNames[sortDirection || "asc"];
// }

function Header({
  style,
  header,
  align,
  tooltipText,
}: {|
  +style: Style,
  +header: React.Node,
  +align: "left" | "center" | "right",
  +tooltipText: ?string,
|}) {
  return (
    <div
      className={css(
        styles.cell,
        styles.header,
        align === "center" && styles.alignCenter,
        align === "right" && styles.alignRight
      )}
      style={style}
    >
      {tooltipText != null ? (
        <Tooltip
          placement="bottom"
          overlay={<span className={css(styles.tooltip)}>{tooltipText}</span>}
        >
          <div className={css(styles.tooltipHeader)}>
            <Text scale="subtext" color="grey40">
              {header}
            </Text>
          </div>
        </Tooltip>
      ) : (
        <Text scale="subtext" color="grey50">
          {header}
        </Text>
      )}
    </div>
  );
}

// function SortableHeader({
//   style,
//   onSortDirectionChange,
//   sortDirection,
//   header,
//   align,
//   tooltipText,
// }: {|
//   +style: Style,
//   +onSortDirectionChange: ("asc" | "desc" | null) => void,
//   +sortDirection: "asc" | "desc" | null,
//   +header: React.Node,
//   +align: "left" | "center" | "right",
//   +tooltipText: ?string,
// |}) {
//   const [isHovered, setHovered] = React.useState(false);
//   const isSorted = sortDirection !== null;
//
//   return (
//     <Clickable
//       onClick={() => {
//         if (sortDirection === null) {
//           onSortDirectionChange("asc");
//         } else if (sortDirection === "asc") {
//           onSortDirectionChange("desc");
//         } else {
//           onSortDirectionChange(null);
//         }
//       }}
//     >
//       <div
//         className={css(
//           styles.cell,
//           styles.header,
//           styles.clickable,
//           align === "center" && styles.alignCenter,
//           align === "right" && styles.alignRight
//         )}
//         style={style}
//         onMouseEnter={() => setHovered(true)}
//         onMouseLeave={() => setHovered(false)}
//       >
//         <div className={css(styles.sortableHeader)}>
//           {tooltipText != null ? (
//             <Tooltip
//               placement="bottom"
//               overlay={
//                 <span className={css(styles.tooltip)}>{tooltipText}</span>
//               }
//             >
//               <div className={css(styles.tooltipHeader)}>
//                 <Text
//                   scale="subtext"
//                   weight={isSorted ? "bold" : "regular"}
//                   color={isSorted ? "grey60" : "grey40"}
//                 >
//                   {header}
//                 </Text>
//               </div>
//             </Tooltip>
//           ) : (
//             <Text
//               scale="subtext"
//               weight={isSorted ? "bold" : "regular"}
//               color={isSorted ? "grey60" : "grey40"}
//             >
//               {header}
//             </Text>
//           )}
//           {isSorted || isHovered ? (
//             <div className={css(styles.headerSortIcon)}>
//               <Icon
//                 alignment="center"
//                 color={isSorted ? "grey60" : "grey40"}
//                 size="xxxs"
//                 iconName={getIcon(sortDirection)}
//               />
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </Clickable>
//   );
// }

function Row<T>({
  data,
  columns,
  className,
  style,
  onHighlightedChange,
  onClick,
}: {|
  +data: T,
  +columns: $ReadOnlyArray<Column<T>>,
  +className: string,
  +style: Style,
  +onHighlightedChange: boolean => void,
  +onClick: (() => void) | null,
|}) {
  // const leftPinnedColumns = columns.filter(({pinned}) => pinned === "left");
  // const unpinnedColumns = columns.filter(({pinned}) => pinned === null);
  // const rightPinnedColumns = columns.filter(({pinned}) => pinned === "right");

  return (
    <tr className={css(styles.row)}>
      {columns.map(column => (
        <td>{column.render(data)}</td>
      ))}
    </tr>
  );

  // return (
  //   <Clickable onClick={onClick}>
  //     <div
  //       onMouseEnter={() => onHighlightedChange(true)}
  //       onMouseLeave={() => onHighlightedChange(false)}
  //       className={className}
  //       style={style}
  //     >
  //       {leftPinnedColumns.length ? (
  //         <div className={css(styles.leftPinnedDrawer)}>
  //           {leftPinnedColumns.map(({id, Cell}) => (
  //             <Cell key={id} row={data} />
  //           ))}
  //         </div>
  //       ) : null}
  //       <div className={css(styles.unpinnedDrawer)}>
  //         {unpinnedColumns.map(({id, Cell}) => (
  //           <Cell key={id} row={data} />
  //         ))}
  //       </div>
  //       {rightPinnedColumns.length ? (
  //         <div className={css(styles.rightPinnedDrawer)}>
  //           {rightPinnedColumns.map(({id, Cell}) => (
  //             <Cell key={id} row={data} />
  //           ))}
  //         </div>
  //       ) : null}
  //     </div>
  //   </Clickable>
  // );
}

// function AggregateRow<T>({
//   data,
//   columns,
//   className,
//   style,
//   onHighlightedChange,
//   onClick,
// }: {|
//   +data: $ReadOnlyArray<T>,
//   +columns: $ReadOnlyArray<Column<T>>,
//   +className: string,
//   +style: Style,
//   +onHighlightedChange: boolean => void,
//   +onClick: (() => void) | null,
// |}) {
//   const leftPinnedColumns = columns.filter(({pinned}) => pinned === "left");
//   const unpinnedColumns = columns.filter(({pinned}) => pinned === null);
//   const rightPinnedColumns = columns.filter(({pinned}) => pinned === "right");
//
//   return (
//     <Clickable onClick={onClick}>
//       <div
//         onMouseEnter={() => onHighlightedChange(true)}
//         onMouseLeave={() => onHighlightedChange(false)}
//         className={className}
//         style={style}
//       >
//         {leftPinnedColumns.length ? (
//           <div className={css(styles.leftPinnedDrawer)}>
//             {leftPinnedColumns.map(({id, AggregateCell}) => (
//               <AggregateCell key={id} rows={data} />
//             ))}
//           </div>
//         ) : null}
//         <div className={css(styles.unpinnedDrawer)}>
//           {unpinnedColumns.map(({id, AggregateCell}) => (
//             <AggregateCell key={id} rows={data} />
//           ))}
//         </div>
//         {rightPinnedColumns.length ? (
//           <div className={css(styles.rightPinnedDrawer)}>
//             {rightPinnedColumns.map(({id, AggregateCell}) => (
//               <AggregateCell key={id} rows={data} />
//             ))}
//           </div>
//         ) : null}
//       </div>
//     </Clickable>
//   );
// }

const styles = StyleSheet.create({
  table: {
    height: "100%",
    overflow: "auto",
    position: "relative",
  },
  leftPinnedDrawer: {
    position: "sticky",
    display: "flex",
    left: 0,
    backgroundColor: "inherit",
    borderRight: `2px solid ${colors.grey30}`,
    paddingLeft: 12,
    zIndex: 1,
  },
  unpinnedDrawer: {
    display: "flex",
    paddingLeft: 12,
  },
  rightPinnedDrawer: {
    position: "sticky",
    display: "flex",
    right: 0,
    backgroundColor: "inherit",
    borderLeft: `2px solid ${colors.grey30}`,
    paddingLeft: 12,
    zIndex: 1,
  },
  rowExpansionCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: ROW_EXPANSION_COLUMN_WIDTH,
  },
  rowSelectionCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: ROW_SELECTION_COLUMN_WIDTH,
  },
  tooltipHeader: {
    borderBottom: `1px dashed ${colors.grey40}`,
  },
  tooltip: {
    display: "block",
    width: 150,
    wordWrap: "break-word",
  },
  cell: {
    display: "flex",
    textOverflow: "ellipsis",
    overflowX: "hidden",
    whiteSpace: "nowrap",
    minWidth: 0,
    paddingLeft: COLUMN_PADDING,
    paddingRight: COLUMN_PADDING,
  },
  alignCenter: {
    justifyContent: "center",
  },
  alignRight: {
    justifyContent: "flex-end",
  },
  headerRow: {
    // display: "inline-flex",
    backgroundColor: "white",
    borderTop: `1px solid ${colors.grey30}`,
    borderBottom: `1px solid ${colors.grey30}`,
    // position: "sticky",
    zIndex: 2,
    // top: 0,
    // left: 0,
    // width: "100%",
    height: HEADER_HEIGHT,
  },
  header: {
    alignItems: "center",
    color: colors.grey50,
    backgroundColor: "inherit",
    ":hover": {
      color: colors.grey60,
    },
  },
  sortableHeader: {
    position: "relative",
    display: "flex",
  },
  headerSortIcon: {
    position: "absolute",
    left: "calc(100% + 6px)",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  clickable: {
    cursor: "pointer",
  },
  row: {
    // display: "flex",
    backgroundColor: "white",
    borderBottom: `1px solid ${colors.grey30}`,
    minHeight: 44,
  },
  columnCustomizationContainer: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    right: 0,
    zIndex: 3,
    borderTop: `1px solid ${colors.grey30}`,
    borderBottom: `1px solid ${colors.grey30}`,
    borderLeft: `1px solid ${colors.grey30}`,
    padding: "0 12px",
    background: "white",
    height: HEADER_HEIGHT,
  },
  columnCustomizationPopup: {
    background: "white",
    boxShadow: "0px 0px 20px rgba(57, 65, 77, 0.15)",
    minWidth: 200,
    marginTop: 4,
    padding: 12,
  },
  infiniteLoader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 0px",
  },
  loadingIndicator: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 0px",
  },
  isHighlighted: {
    backgroundColor: latitudeColors.grey10,
  },
  isSelected: {
    backgroundColor: latitudeColors.grey20,
    borderBottom: `1px solid ${latitudeColors.grey60}`,
  },
  isNextSelected: {
    borderBottom: `1px solid ${latitudeColors.grey60}`,
  },
});

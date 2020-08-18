/**
 * External dependencies
 */
import { mapValues, mergeWith, isFunction } from 'lodash';

/**
 * Internal dependencies
 */
import { hasBlockSupport } from '..';

/**
 * Given raw transforms from blocks, merges all schemas into one.
 *
 * @param {Array}  transforms            Block transforms, of the `raw` type.
 * @param {Object} phrasingContentSchema The phrasing content schema.
 * @param {Object} isPaste               Whether the context is pasting or not.
 *
 * @return {Object} A complete block content schema.
 */
export default function getBlockContentSchema(
	transforms,
	phrasingContentSchema,
	isPaste
) {
	const schemas = transforms.map( ( { isMatch, blockName, schema } ) => {
		const hasAnchorSupport = hasBlockSupport( blockName, 'anchor' );

		schema = isFunction( schema )
			? schema( { phrasingContentSchema, isPaste } )
			: schema;

		// If the block does not has anchor support and the transform does not
		// provides an isMatch we can return the schema right away.
		if ( ! hasAnchorSupport && ! isMatch ) {
			return schema;
		}

		return mapValues( schema, ( value ) => {
			let attributes = value.attributes || [];
			// If the block supports the "anchor" functionality, it needs to keep its ID attribute.
			if ( hasAnchorSupport ) {
				attributes = [ ...attributes, 'id' ];
			}
			return {
				...value,
				attributes,
				isMatch: isMatch ? isMatch : undefined,
			};
		} );
	} );

	return mergeWith( {}, ...schemas, ( objValue, srcValue, key ) => {
		switch ( key ) {
			case 'children': {
				if ( objValue === '*' || srcValue === '*' ) {
					return '*';
				}

				return { ...objValue, ...srcValue };
			}
			case 'attributes':
			case 'require': {
				return [ ...( objValue || [] ), ...( srcValue || [] ) ];
			}
			case 'isMatch': {
				// If one of the values being merge is undefined (matches everything),
				// the result of the merge will be undefined.
				if ( ! objValue || ! srcValue ) {
					return undefined;
				}
				// When merging two isMatch functions, the result is a new function
				// that returns if one of the source functions returns true.
				return ( ...args ) => {
					return objValue( ...args ) || srcValue( ...args );
				};
			}
		}
	} );
}
